from urllib.parse import urlparse
import hashlib
import geoip2.database
import re
import json
import tldextract
import dns.resolver


class Technology:

    def __init__(self):
        self.patterns = []
        with open('technology_patterns.txt', 'r') as file:
            for line in file:
                if line.strip() and not line.startswith('#'):
                    pattern, technology = line.strip().split(',', 1)
                    self.patterns.append({'pattern': pattern, 'technology': technology})

    def get_technology_from_url(self, url):
        for pattern in self.patterns:
            if re.search(pattern['pattern'], url, re.IGNORECASE):
                return pattern['technology']
        return False

    def getTech(self, script_tags, link_tags, requests_in):
        def extract_components(tags, attr):
            return [
                {'url': tag[attr], 'name': self.get_technology_from_url(tag[attr])}
                for tag in tags if attr in tag.attrs and self.get_technology_from_url(tag[attr])
            ]

        script_components = extract_components(script_tags, 'src')
        link_components = extract_components(link_tags, 'href')
        request_components = [
            {'url': request_data['request']['url'],
             'name': self.get_technology_from_url(request_data['request']['url'])}
            for request_data in requests_in.values()
            if self.get_technology_from_url(request_data['request']['url'])
        ]
        tech = script_components + link_components + request_components
        unique_tech = {comp['name']: comp for comp in tech}
        return list(unique_tech.values())


class Resources:

    @staticmethod
    def getResources(raw, driver_session, report_id, scan_url):
        mapping = []
        resource_master = {}
        for request_id, data in raw.items():
            if 'response' in data:
                try:
                    response_body = driver_session.execute_cdp_cmd('Network.getResponseBody', {'requestId': request_id})
                    if 'body' in response_body:
                        _sha256_hash = hashlib.sha256()
                        _sha256_hash.update(response_body['body'].encode('utf-8'))
                        sha256 = _sha256_hash.hexdigest()
                        mapping.append({'sha256': sha256, 'url': data['request']['url'], "mime_type": data['response']['mimeType']})
                        resource_master[sha256] = {"report_id": report_id, "raw_data": response_body['body'],
                                                   "sha256": sha256, "mime_type": data['response']['mimeType'],
                                                   "request_id": request_id, "submission_url": scan_url,
                                                   "resource_url": data['response']['url']}
                except:
                    pass
        return mapping, resource_master


class Formatting:

    @staticmethod
    def clean_data(report):
        for _request in report['request']:
            _request['request'].pop('initialPriority', False)
            _request['request'].pop('isLinkPreload', False)
            _request['request'].pop('isSameSite', False)
            _request['request'].pop('mixedContentType', False)

            clean_keys = {"hasPostData": "has_post_data", "postData": "post_data", "postDataEntries": "post_data_entry", "referrerPolicy": "referrer_policy"}
            for k, v in clean_keys.items():
                try:
                    _request['request'][v] = _request['request'].pop(k)
                except:
                    continue

            if 'response' in _request:
                _request['response'].pop('timing', False)
                _request['response'].pop('alternateProtocolUsage', False)
                _request['response'].pop('charset', False)
                _request['response'].pop('connectionId', False)
                _request['response'].pop('connectionReused', False)
                _request['response'].pop('fromDiskCache', False)
                _request['response'].pop('fromPrefetchCache', False)
                _request['response'].pop('fromDiskCache', False)
                _request['response'].pop('fromServiceWorker', False)

                clean_keys = {"encodedDataLength": 'encoded_data_length', "mimeType": "mime_type", "remoteIPAddress": "ip", "remotePort": "port", "responseTime": "response_time", "securityDetails": "security_details", "securityState": "security_state", "statusText": "status_text"}
                for k, v in clean_keys.items():
                    try:
                        _request['response'][v] = _request['response'].pop(k)
                    except:
                        continue

        for certificate in report['certificate']:

            certificate.pop('certificateId', False)
            certificate.pop('certificateTransparencyCompliance', False)
            certificate.pop('encryptedClientHello', False)

            clean_keys = {"keyExchange": "key_exchange", "keyExchangeGroup": "key_exchange_group", "sanList": "san_list", "serverSignatureAlgorithm": "signature_algorithm", "subjectName": "subject_name", "validFrom": "valid_from", "validTo": "valid_to"}
            for k, v in clean_keys.items():
                try:
                    certificate[v] = certificate.pop(k)
                except:
                    continue

        for cookie in report['cookie']:
            clean_keys = {"httpOnly": "http_only", "sameSite": "same_site"}
            for k, v in clean_keys.items():
                try:
                    cookie[v] = cookie.pop(k)
                except:
                    continue

        return report

    @staticmethod
    def transform_headers(report):
        for request in report['request']:
            _headers = []
            _details = []
            for header in request['request']['headers']:
                _headers.append({"name": str(header), "value": str(request['request']['headers'][header])})
            request['request']['headers'] = _headers
            if 'response' in request:
                _headers = []
                for header in request['response']['headers']:
                    _headers.append({"name": str(header), "value": str(request['response']['headers'][header])})
                request['response']['headers'] = _headers
                if 'securityDetails' in request['response']:
                    for detail in request['response']['securityDetails']:
                        _details.append(
                            {"name": detail, "value": str(request['response']['securityDetails'][detail])})
                    request['response']['securityDetails'] = _details
        return report

    @staticmethod
    def format_errors(error_log):
        results = {}
        for error in error_log:
            if error['error'] not in results:
                results[error['error']] = []
            results[error['error']].append(error['url'])
        return results


class Enrichment:

    def __init__(self):
        self.ip_asn = geoip2.database.Reader(r'geoIP/GeoLite2-ASN.mmdb')
        self.ip_country = geoip2.database.Reader(r'geoIP/GeoLite2-Country.mmdb')
        self.country_cache = {}
        self.asn_cache = {}

    def domain_info(self, domain, raw):
        master = {'hosting_scripts': False,
                  'mime_type': [],
                  'whois': {},
                  'resource': [],
                  'ip': '',
                  'response_code': [],
                  'request': [],
                  'sub_domain': [],
                  'total_response_size': 0.0,
                  'server': '',
                  'root': False}

        for request in raw['request']:
            _domain, sub, tld = self.domain_extract(request['response']['url'])
            if _domain == domain:
                url = request['response'].get('url', '')
                mime_type = request['response'].get('mimeType', '')
                ip = request['response'].get('remoteIPAddress', '')
                response_code = request['response'].get('status', '')
                size = request['response'].get('encodedDataLength', '')

                master['request'].append(
                    {'url': url, "mime_type": mime_type,
                     'ip': ip, 'response_code': response_code,
                     'encoded_data_length': size})

                if not master['ip'] and request['response'].get('remoteIPAddress'):
                    master['ip'] = request['response']['remoteIPAddress']

                master['total_response_size'] += float(request['response']['encodedDataLength'])
                master['name'] = _domain
                master['sub_domain'].append(sub)
                master['tld'] = tld
                master['response_code'].append(request['response']['status'])
                master['mime_type'].append(request['response']['mimeType'])


                for header in request['response']['headers']:
                    if header['name'].lower() == 'server':
                        master['server'] = header['value']

                for resource in raw['resource']:
                    resource_domain, sub, tld = self.domain_extract(resource['url'])
                    if resource_domain == _domain:
                        master['resource'].append(resource)

                for certificate in raw['certificate']:
                    if certificate['domain_name'] == master['name']:
                        master['certificate'] = certificate

        master['response_code'] = list(set(master['response_code']))
        master['mime_type'] = list(set(master['mime_type']))
        master['sub_domain'] = list(set(master['sub_domain']))
        master['request_count'] = len(master['request'])
        master['dns'] = self.get_dns_info(domain)

        if master['ip'] and (master['ip'] in self.country_cache and master['ip'] in self.asn_cache):
            master['country'] = self.country_cache[master['ip']]
            master['asn'] = self.asn_cache[master['ip']]
        elif master['ip']:
            master['country'] = self.ip2country(master['ip'])
            master['asn'] = self.ip2asn(master['ip'])

        for mime in master['mime_type']:
            if 'script' in mime:
                master['hosting_scripts'] = True
                break

        resource_clean = {}
        for resource in master['resource']:
            if resource['sha256'] not in resource_clean:
                resource_clean[resource['sha256']] = resource

        master['resource'] = [resource_clean[resource] for resource in resource_clean]

        return master

    @staticmethod
    def scanMeta(report):
        meta = {'request_count': 0, 'script_count': 0, 'domain_count': 0, 'submission_url': report['submission_url'], 'submission_utc': report['submission_utc'], 'risk_score': ''}
        meta['submission'] = report['submission_url']
        meta['submission_utc'] = report['submission_utc']
        meta['report_id'] = report['report_id']
        if 'request' in report:
            meta['request_count'] = len(report['request'])
        if 'page_scripts' in report:
            meta['script_count'] = len(report['page_scripts'])
        if 'domain' in report:
            meta['domain_count'] = len(report['domain'])
        report['meta'] = meta
        return report

    def thirdParties(self,raw, resolved_url):
        root_domain = tldextract.extract(resolved_url).registered_domain
        domains = list({self.domain_extract(request['request']['url'])[0] for request in raw['request']})
        master = []
        for domain in domains:
            analysis = self.domain_info(domain, raw)
            analysis['root'] = (domain == root_domain)
            master.append(analysis)
        return master

    def ip2country(self, ip):
        result = self.ip_country.country(ip)
        country = {"name": result.country.name, "iso": result.country.iso_code}
        self.country_cache[ip] = country
        return country

    def ip2asn(self, ip):
        result = self.ip_asn.asn(ip)
        asn = {"number": result.autonomous_system_number, "name": result.autonomous_system_organization,
               "network": str(result.network)}
        self.asn_cache[ip] = asn
        return asn

    @staticmethod
    def get_dns_info(domain):
        dns_info = {}
        record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA', 'PTR']
        try:
            for record_type in record_types:
                try:
                    answers = dns.resolver.resolve(domain, record_type)
                    dns_info[record_type.lower()] = [str(answer) for answer in answers]
                except dns.resolver.NoAnswer:
                    dns_info[record_type.lower()] = []
                except dns.resolver.NXDOMAIN:
                    return {"error": "Domain does not exist"}
                except Exception as e:
                    dns_info[record_type] = f"Error retrieving {record_type} records: {e}"
        except Exception as e:
            return {"error": f"Error retrieving DNS info: {e}"}
        return dns_info

    @staticmethod
    def domain_extract(url):
        dirty = urlparse(url).netloc
        clean = tldextract.extract(dirty)
        return clean.registered_domain, clean.subdomain, clean.suffix

    @staticmethod
    def response_data(logs, network_data):
        for entry in logs:
            log = json.loads(entry['message'])['message']
            if log['method'] == 'Network.requestWillBeSent':
                network_data['request'][log['params']['requestId']] = {
                    'request': log['params']['request'],
                }
            if log['method'] == 'Network.responseReceived':
                request_id = log['params']['requestId']
                if request_id in network_data['request']:
                    network_data['request'][request_id]['response'] = log['params']['response']
        return network_data

    @staticmethod
    def server_data(report):
        results = {}
        for domain in report['domain']:
            ip = domain['ip']
            master = {
                'hosting_scripts': False,
                'mime_type': [],
                'ip': '',
                'country': None,
                'asn': None,
                'resource': [],
                'response_code': [],
                'domain': [],
                'total_response_size': 0.0,
                'server': [],
            }

            if ip not in results:
                master['ip'] = ip
                master['hosting_scripts'] = domain['hosting_scripts']
                master['response_code'] = domain['response_code']
                master['mime_type'] = domain['mime_type']
                master['resource'] = domain['resource']
                if 'country' in domain:
                    master['country'] = domain['country']

                if 'asn' in domain:
                    master['asn'] = domain['asn']
                master['domain'].append(domain['name'])
                master['total_response_size'] = domain['total_response_size']
                if domain['server']:
                    master['server'].append(domain['server'])
                results[ip] = master
            else:
                results[ip]['ip'] = ip
                results[ip]['domain'].append(domain['name'])

                if domain['hosting_scripts'] and not results[ip]['hosting_scripts']:
                    results[ip]['hosting_scripts'] = True

                if domain['name'] not in results[ip]['domain']:
                    results[ip]['domain'].append(domain['name'])

                if domain['server']:
                    results[ip]['name'].append(domain['server'])

                for mime in domain['mime_type']:
                    results[ip]['mime_type'].append(mime)

                for resource in domain['resource']:
                    results[ip]['resource'].append(resource)

                for response_code in domain['response_code']:
                    results[ip]['response_code'].append(response_code)

                results[ip]['total_response_size'] += float(domain['total_response_size'])

        for server in results:

            resource_clean = {}
            for resource in results[server]['resource']:
                if resource['sha256'] not in resource_clean:
                    resource_clean[resource['sha256']] = resource

            results[server]['resource'] = [resource_clean[resource] for resource in resource_clean]
            results[server]['response_code'] = list(set(results[server]['response_code']))
            results[server]['server'] = list(set(results[server]['server']))
            results[server]['mime_type'] = list(set(results[server]['mime_type']))
            results[server]['domain'] = list(set(results[server]['domain']))

        return [results[result] for result in results]
