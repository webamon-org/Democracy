import logging
from opensearchpy import OpenSearch, RequestsHttpConnection
import requests
import warnings
import urllib3
import json
import base64
from datetime import timezone, datetime
from datetime import datetime
warnings.filterwarnings('ignore', category=urllib3.exceptions.InsecureRequestWarning)


class Helper:
    def __init__(self, config):
        self.config = config
        self.save_dom = config['save_dom']
        self.save_resources = config['save_resources']
        self.save_css = config['save_css']
        self._resources = config['resources']
        self.save_images = config['save_images']
        self.auth = tuple(json.loads(config['elastic_creds']))
        logging.basicConfig(level=eval(f'logging.{config["log_level"]}'))
        self.logger = logging.getLogger(__name__)
        self.elastic_base = config['elastic_base']
        _elastic_base = self.elastic_base.split('://')
        self.protocol = _elastic_base[0]
        self.host, self.port = tuple(_elastic_base[1].split(':'))

    def id_exists(self, _id, index):
        self.logger.debug(f'Checking if {_id} exists on {index}')
        exists = requests.get(f'{self.elastic_base}/{index}/_doc/{_id}', auth=self.auth, verify=False)
        try:
            return exists.json()['found']
        except:
            self.logger.critical(f'ERROR: {exists.text}')
            return False

    def get_record(self, _id, index):
        record = requests.get(f'{self.elastic_base}/{index}/_doc/{_id}', auth=self.auth, verify=False).json()
        return record['_source']

    def raw_save(self, index, data, _id=''):
        print('raw_save START')
        path = f'{index}/_doc'
        if _id:
            if self.id_exists(_id, index):
                self.logger.debug(f'Not saving - Already exists {index}/{_id}')
                return False
            path += f'/{_id}'
        else:
            path += f'/_id'
        response = requests.post(f'{self.config["elastic_base"]}/{path}', headers={'Content-Type': 'application/json'}, auth=self.auth, data=json.dumps(data), verify=False)
        print(response.text)
        if response.status_code not in [200, 201]:
            self.logger.critical(f'Failed to save {index}/{_id}')
            self.logger.critical(response.text)
            return False
        self.logger.debug(f'Successfully saved - {index}/{_id}')
        return True

    def value_exists(self, field, value, index, response):
        query = {"query": {"bool": {"must": [{"query_string": { "query": f'{field}:"{value}"'}}]}, }, "_source": [response], "size": 1}
        response = requests.post(f'{self.elastic_base}/{index}/_search',
                                 headers={'Content-Type': 'application/json'}, data=json.dumps(query),
                                 auth=self.auth, verify=False).json()
        if len(response['hits']['hits']) > 0:
            return response['hits']['hits'][0]['_source']['report_id']
        return False

    def format_bulk_data_resources(self, docs, feed, tag):
        bulk_data = ""
        for doc in docs:
            if not self.id_exists(doc, 'resources'):
                try:
                    if not self.save_images and 'image' in docs[doc]['mime_type'].lower():
                        logging.debug(f"Not saving image resource {doc} - {docs[doc]['mime_type']}")
                        continue
                    if not self.save_css and 'css' in docs[doc]['mime_type'].lower():
                        logging.debug(f"Not saving CSS resource {doc} - {docs[doc]['mime_type']}")
                        continue
                    logging.info(f"Saving Resource {doc} - {docs[doc]['mime_type']}")
                    index_metadata = json.dumps({ "index": {"_index": 'resources', "_id": doc}})
                    doc_data = json.dumps({"date": datetime.utcnow().strftime("%Y-%m-%d"), "feed": feed, "tag": [tag], "resource": docs[doc]['raw_data'], "mime_type": docs[doc]['mime_type'], 'sha256': doc, "ip": [], "asn": [], "country": [], "domains": [], "notes": []})
                    bulk_data += f"{index_metadata}\n{doc_data}\n"
                except Exception as e:
                    self.logger.critical(f'{e} - happened')
                    self.logger.critical(docs[doc])
            else:
                self.logger.debug(f'Resource - {doc} - Already Exists')
        return bulk_data if len(bulk_data) > 0 else False

    def query(self, index, query_string, limit=2000):
        client = OpenSearch(
            hosts=[{'host': self.host, 'port': self.port}],
            http_auth=self.auth,
            use_ssl=True if self.protocol == 'https' else False,
            verify_certs=False,
            connection_class=RequestsHttpConnection,
            timeout=300
        )
        response = client.search(index=index, body={"query": {"query_string": {"query": query_string}},"size":limit})
        hits = response["hits"]["hits"]
        formatted_results = []
        for hit in hits:
            source = hit["_source"]
            formatted_hit = {
                "id": hit["_id"],
                "score": hit["_score"],
                "fields": source  # Include all fields from the document
            }
            formatted_results.append(formatted_hit)
        return formatted_results

    def save_report(self, report):
        client = OpenSearch(
            hosts=[{'host': self.host, 'port': self.port}],
            http_auth=self.auth,
            use_ssl=True if self.protocol == 'https' else False,
            verify_certs=False,
            connection_class=RequestsHttpConnection,
            timeout=300
        )
        resources = report.pop('resource_master', False)
        if not self.save_dom:
            self.logger.debug("NOT SAVING DOM")
            report.pop('pageDOM', False)
        self.logger.debug("SAVING REPORT TO OPENSEARCH")
        response = client.index(index='scans', body=report, id=report['report_id'])
        if self.save_resources:
            if resources:
                self.logger.info("SAVING RESOURCES")
                bulk_data = self.format_bulk_data_resources(resources, report['feed'], report['tag'])
                if bulk_data:
                    response = requests.post(f'{self.config["elastic_base"]}/_bulk', headers={"Content-Type": "application/json"}, data=bulk_data, verify=False,
                                             auth=self.auth)
                    # self.logger.debug(response.text)
                    if response.status_code != 200 or response.json().get('errors', False):
                        self.logger.critical(f"Error posting bulk data: {response.text}")
                        return False
                else:
                    self.logger.info('No new resources to save')
        return True


class Domains(Helper):

    def get_domain(self, domain):
        domain_b64 = base64.b64encode(domain.encode('utf-8')).decode('utf-8')
        return self.get_record(domain_b64, 'domains')

    def update(self, domain_record):
        print('domains update start')
        domain = domain_record['name']
        domain_b64 = base64.b64encode(domain.encode('utf-8')).decode('utf-8')
        index = 'domains'

        domain_record.pop('method', False)
        domain_record.pop('mime_type', False)
        domain_record.pop('request_count', False)
        domain_record.pop('response_code', False)
        domain_record.pop('request', False)
        domain_record.pop('total_response_size', False)
        domain_record.pop('root', False)
        print('last_update',str(datetime.now(timezone.utc))[:19])
        domain_record['last_update'] = datetime.utcnow().strftime("%Y-%m-%d")
        domain_record['last_update_utc'] = str(datetime.now(timezone.utc))[:19]

        exists = self.id_exists(domain_b64, index)
        if not exists:
            domain_record['first_seen_utc'] = str(datetime.now(timezone.utc))[:19]
            save = self.raw_save(index, domain_record, domain_b64)
            return save

        old_record = self.get_domain(domain)

        hashes = [record['sha256'] for record in domain_record['resource']]
        for resource in old_record['resource']:
            if resource['sha256'] not in hashes:
                domain_record['resource'].append(resource['sha256'])

        for record in domain_record:
            if record == "sub_domain" and record in old_record:
                domain_record[record] = list(set(old_record[record] + domain_record[record]))

            if record == 'dns' and 'dns' in old_record:
                for dns_record in domain_record['dns']:
                    if dns_record in old_record['dns']:
                        if type(old_record['dns'][dns_record]) is list:
                            domain_record['dns'][dns_record] = list(set(old_record['dns'][dns_record] + domain_record['dns'][dns_record]))

        print(domain_record['last_update_utc'])
        print('saving')
        save = self.raw_save(index, domain_record, domain_b64)
        print(save)
        return save


class Servers(Helper):

    def get_server(self, ip):
        ip_b64 = base64.b64encode(ip.encode('utf-8')).decode('utf-8')
        return self.get_record(ip_b64, 'servers')

    def update(self, server_record):
        ip = server_record['ip']
        ip_b64 = base64.b64encode(ip.encode('utf-8')).decode('utf-8')
        index = 'servers'

        server_record.pop('total_response_size')
        server_record.pop('mime_type')
        server_record.pop('response_code')
        server_record['last_update'] = datetime.utcnow().strftime("%Y-%m-%d")
        server_record['last_update_utc'] = str(datetime.now(timezone.utc))[:19]

        exists = self.id_exists(ip_b64, index)
        if not exists:
            server_record['first_seen_utc'] = str(datetime.now(timezone.utc))[:19]
            save = self.raw_save(index, server_record, ip_b64)
            return save

        old_record = self.get_server(ip)
        hashes = [record['sha256'] for record in server_record['resource']]

        for resource in old_record['resource']:
            if resource['sha256'] not in hashes:
                server_record['resource'].append(resource['sha256'])

        server_record['domain'] = list(set(old_record['domain'] + server_record['domain']))
        server_record['server'] = list(set(old_record['server'] + server_record['server']))

        save = self.raw_save(index, server_record, ip_b64)
        return save



