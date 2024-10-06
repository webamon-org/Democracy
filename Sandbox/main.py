import os
import time

import requests
from report import Formatting, Technology, Resources, Enrichment
from selenium.common.exceptions import WebDriverException
from threatai import analyze
import argparse
import uuid
from selenium import webdriver
from bs4 import BeautifulSoup
import datetime
from datetime import timezone
import json
import threading
from opensearch import Helper, Domains, Servers
from community import Democracy
import logging
import urllib3
import distutils.util
import queue
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import base64

warnings.filterwarnings('ignore', category=urllib3.exceptions.InsecureRequestWarning)

enrich = Enrichment()
tech = Technology()


def get_config():
    parser = argparse.ArgumentParser(description='Process some configurations.')
    parser.add_argument('--resources', type=str, choices=["images", "scripts", "all", "none", "txt_html"], help='Select which resources to save to Elastic',
                        default=os.getenv('resources', 'scripts'))
    parser.add_argument('--threads', type=int, help='Count of threads to run', default=int(os.getenv('threads', 2)))
    parser.add_argument('--source', type=str, choices=[], help='Source data which contains the domains/urls to scan',
                        default=os.getenv('source', 'openphish'))
    parser.add_argument('--elastic_query', type=str, help='Query to use when source is set to query',
                        default=os.getenv('elastic_query', ''))
    parser.add_argument('--elastic_size', type=int, help='Max results to return from elasticsearch query',
                        default=int(os.getenv('elastic_size', 100)))
    parser.add_argument('--tag', type=str, help='Tag to add to scan report',
                        default=os.getenv('tag', ''))
    parser.add_argument('--save_screenshot', type=str, help='Save screenshot true/false',
                        default=str(os.getenv('save_screenshot', "False")))
    parser.add_argument('--scan_timeout', type=int, help='Time in seconds to wait for url to load',
                        default=int(os.getenv('scan_timeout', 30)))
    parser.add_argument('--save_elastic', type=str, help='Save data (report/resources) to elastic',
                        default=str(os.getenv('save_elastic', "True")))
    parser.add_argument('--save_dom', type=str, help='Save DOM to elastic',
                        default=str(os.getenv('save_dom', "True")))
    parser.add_argument('--threat_ai', type=str, help='Webamon AI analyse final report',
                        default=str(os.getenv('threat_ai', "False")))
    parser.add_argument('--threat_ai_endpoint', type=str, help='Webamon AI endpoint for LLM',
                        default=str(os.getenv('threat_ai_endpoint', '')))
    parser.add_argument('--hash_types', type=list, help='List of hash types to compute for resources',
                        default=list(os.getenv('hash_types', ["sha256"])))
    parser.add_argument('--whois', type=str, choices=["ALL", "MAIN", "NONE"], help='Lookup Domain(s) WHOIS info',
                        default=os.getenv('whois', 'NONE'))
    parser.add_argument('--dns', type=str, choices=["ALL", "MAIN", "NONE"], help='Lookup Domain(s) DNS info',
                        default=os.getenv('dns', 'NONE'))
    parser.add_argument('--scan_type', type=str, choices=["NONE","daily_openphish"], help='Run a pre-configured scan config template',
                        default=os.getenv('scan_type', 'NONE'))
    parser.add_argument('--check_dangling', type=str, choices=["ALL", "MAIN", "NONE"], help='Check for dangling dns records',
                        default=os.getenv('check_dangling', 'NONE'))
    parser.add_argument('--user_agent', type=str, help='Set Custom User Agent String',
                        default=os.getenv('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3'))
    parser.add_argument('--webamon_proxy', type=str, help='Set Forwarding proxy to send requests from',
                        default=os.getenv('webamon_proxy', 'NONE'))
    parser.add_argument('--webamon_monitor', type=str, choices=["ALL", "MAIN", "NONE"], help='Monitor url/domain for changes',
                        default=os.getenv('webamon_monitor', 'NONE'))
    parser.add_argument('--monitor_profile', type=str, choices=[], help='Supply monitoring template',
                        default=os.getenv('monitor_profile', 'NONE'))
    parser.add_argument('--aws_save', type=str, help='Save all resources to aws',
                        default=str(os.getenv('aws_save', "False")))
    parser.add_argument('--aws_key', type=str, help='aws key',
                        default=os.getenv('aws_key', ''))
    parser.add_argument('--aws_resource_bucket', type=str, help='S3 bucket to save resources',
                        default=os.getenv('aws_resource_bucket', ''))
    parser.add_argument('--aws_dom_bucket', type=str, help='S3 bucket to save DOM',
                        default=os.getenv('aws_dom_bucket', ''))
    parser.add_argument('--aws_screenshot_bucket', type=str, help='S3 bucket to save screenshot',
                        default=os.getenv('aws_screenshot_bucket', ''))
    parser.add_argument('--compare_previous', type=str, help='Return differences between scans',
                        default=str(os.getenv('compare_previous', "False")))
    parser.add_argument('--check_ports', type=str, help='Ports to check if open',
                        default=os.getenv('check_ports', ''))
    parser.add_argument('--port_check_config', type=str, choices=["ALL", "MAIN", "NONE"], help='Domain IPs to check',
                        default=os.getenv('port_check_config', 'NONE'))
    parser.add_argument('--rDNS', type=str, choices=["ALL", "MAIN", "NONE"], help='Reverse lookup IP Address',
                        default=os.getenv('rDNS', 'NONE'))
    parser.add_argument('--feed', type=str, help='Webamon feed to add the results too',
                        default=os.getenv('feed', ''))
    parser.add_argument('--save_resources', type=str, help='Save Resources',
                        default=os.getenv('save_resources', "False"))
    parser.add_argument('--elastic_base', type=str, help='Base url for elastic',
                        default=os.getenv('elastic_base', 'https://localhost:9200'))
    parser.add_argument('--skip_if_exists', type=str, help='Skip if the url has been scanned previously',
                        default=str(os.getenv('skip_if_exists', "False")))
    parser.add_argument('--elastic_query_index', type=str, help='Index to user with elastic_query',
                        default=os.getenv('elastic_query_index', 'feeds'))
    parser.add_argument('--queue_worker', type=str, help='Always on, consumes queue',
                        default=os.getenv('queue_worker', 'False'))
    parser.add_argument('--community', type=str, help='Always on, consumes queue',
                        default=os.getenv('community', 'True'))
    parser.add_argument('--webamon_apikey', type=str, help='Always on, consumes queue',
                        default=os.getenv('webamon_apikey', ''))
    parser.add_argument('--save_images', type=str, help='Save Image Mime Types',
                        default=os.getenv('save_images', 'False'))
    parser.add_argument('--save_css', type=str, help='Save CSS Mime Types',
                        default=os.getenv('save_css', 'False'))
    parser.add_argument('--set_cookies', type=str, help='Set + Change Cookies, dictionary format',
                        default=os.getenv('set_cookies', '{}'))
    parser.add_argument('--log_level', type=str, choices=["INFO", "DEBUG"], help='Set Logging Level INFO/DEBUG',
                        default=os.getenv('log_level', 'INFO'))
    parser.add_argument('--elastic_creds', type=str, help='List contain Username and Password',
                        default=os.getenv('elastic_creds', '["admin","password!"]'))
    parser.add_argument('--url', type=str, help='Pass URL to scan',
                        default=os.getenv('url', ''))
    args = parser.parse_args()
    args = vars(args)
    args['skip_if_exists'] = bool(distutils.util.strtobool(args['skip_if_exists']))
    args['save_resources'] = bool(distutils.util.strtobool(args['save_resources']))
    args['aws_save'] = bool(distutils.util.strtobool(args['aws_save']))
    args['threat_ai'] = bool(distutils.util.strtobool(args['threat_ai']))
    args['save_dom'] = bool(distutils.util.strtobool(args['save_dom']))
    args['save_elastic'] = bool(distutils.util.strtobool(args['save_elastic']))
    args['save_screenshot'] = bool(distutils.util.strtobool(args['save_screenshot']))
    args['queue_worker'] = bool(distutils.util.strtobool(args['queue_worker']))
    args['save_images'] = bool(distutils.util.strtobool(args['save_images']))
    args['save_css'] = bool(distutils.util.strtobool(args['save_css']))
    args['community'] = bool(distutils.util.strtobool(args['community']))

    return args


config = get_config()
print(config)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logging.basicConfig(level=eval(f'logging.{config["log_level"].upper()}'))
logger = logging.getLogger(__name__)
engine_log = {"start_utc": str(datetime.datetime.now(timezone.utc))[:19], "date": datetime.datetime.utcnow().strftime("%Y-%m-%d"), "errors": [], "tag": [], 'engine_id': str(uuid.uuid4())}
app = Flask(__name__)
CORS(app)
q = queue.Queue()

if config['community']:
    democracy = Democracy(config)
    config['save_elastic'] = False
elif config['save_elastic']:
    OpenSearch = Helper(config)
    domains = Domains(config)
    servers = Servers(config)


counter = 0
success = 0
failed = 0
skipped = 0


def get_openPhish():
    response = requests.get("https://www.openphish.com/feed.txt")
    if response.status_code == 200:
        _urls = response.text.splitlines()
        return _urls
    else:
        print(f"Failed to retrieve data: {response.status_code}")
        return False


@app.route('/scan', methods=['POST'])
def enqueue():
    data = request.json
    report_id = ''
    if 'report_id' in data:
        report_id = data['report_id']
    report = phuck(data['submission_url'], report_id)
    if config['community']:
        democracy.save(Formatting.clean_data(report))
    elif config['save_elastic']:
        OpenSearch.save_report(Formatting.clean_data(report))
        if 'domain' in report:
            for domain in report['domain']:
                domains.update(domain)

        if 'server' in report:
            for server in report['server']:
                servers.update(server)
    return jsonify({"scan_status": report['scan_status'], "data": {"submission_url": data['submission_url'], 'report_id': report['report_id']}}), 200


def set_cookies(driver, domain):
    # TODO Change to run after driver.get
    cookies = json.loads(config['set_cookies'])
    if cookies:
        for cookie in cookies:
            logger.info(f'Setting Cookie {cookie}')
            driver.add_cookie({'name': cookie, "value": cookies[cookie], 'domain': f'.{domain}'})
    return driver


def phuck(url, report_id=''):
    time.sleep(1)
    global counter, success, failed
    url = url if url.startswith('https://') or url.startswith('http://') else f'https://{url}'
    start = datetime.datetime.now()
    network_data = {'request': {}, 'submission_utc': str(datetime.datetime.now(timezone.utc))[:19], 'tag': config['tag'], 'report_id': report_id if report_id else str(uuid.uuid4()), 'submission_url': url,
                    'source': config['source'], "feed": config['feed'], "date": datetime.datetime.utcnow().strftime("%Y-%m-%d"), "save_resources": config['resources'], "engine_id": engine_log['engine_id'], "errors": []}
    network_data['domain_name'], network_data['sub_domain'], network_data['tld'] = enrich.domain_extract(url)
    options = webdriver.ChromeOptions()
    service = webdriver.ChromeService("/app/chromedriver")
    options.binary_location = '/app/chrome/chrome'
    options.add_argument("--headless")
    options.add_argument('--no-sandbox')
    options.add_argument("--disable-gpu")
    options.add_argument('--ignore-ssl-errors')
    options.add_argument('--ignore-certificate-errors')
    options.add_argument("--window-size=1280x1696")
    options.add_argument("--single-process")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-dev-tools")
    options.add_argument("--no-zygote")
    options.add_argument(f"user-agent={config['user_agent']}")
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL', 'performance': 'ALL'})
    chrome = set_cookies(webdriver.Chrome(options=options, service=service), network_data['domain_name'])
    chrome.execute_cdp_cmd("Network.enable", {})
    chrome.set_page_load_timeout(config['scan_timeout'])

    try:
        chrome.get(url)
        network_data['dom'] = chrome.page_source
        network_data['page_title'] = chrome.title
        network_data['resolved_url'] = chrome.current_url
        network_data['cookie'] = chrome.get_cookies()
        network_data['resolved_domain'], network_data['resolved_sub_domain'], network_data['resolved_tld'] = enrich.domain_extract(network_data['resolved_url'])
        performance_logs = chrome.get_log('performance')
        network_data = enrich.response_data(performance_logs, network_data)
        network_data['resource'], network_data['resource_master'] = Resources.getResources(network_data['request'], chrome, network_data['report_id'], url)
        if config['save_screenshot']:
            x = chrome.get_screenshot_as_base64()
            screenshot_base64 = chrome.get_screenshot_as_base64()
            screenshot_bytes = base64.b64decode(screenshot_base64)
            image = Image.open(io.BytesIO(screenshot_bytes))
            if image.mode == 'RGBA':
                image = image.convert('RGB')
            new_width = image.width // 2  # For example, reduce by 50%
            new_height = image.height // 2
            resized_image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            resized_image.save(buffer, format="JPEG", quality=50)  # quality=50 reduces the image quality
            compressed_image_bytes = buffer.getvalue()
            compressed_image_base64 = base64.b64encode(compressed_image_bytes).decode('utf-8')
            OpenSearch.raw_save('screenshots',
                                {"screenshot": compressed_image_base64, "page_title": network_data['page_title'],
                                 "domain_name": network_data['domain_name'], "tag": network_data['tag'], 'date': network_data["date"],
                                 "submission_url": network_data['submission_url']}, network_data['report_id'])
        soup = BeautifulSoup(network_data['dom'], 'html.parser')
        script_tags = soup.find_all('script')
        link_tags = soup.find_all('link')
        network_data['page_links'] = [str(x) for x in link_tags]
        network_data['page_scripts'] = [str(x) for x in script_tags]
        network_data['technology'] = tech.getTech(script_tags, link_tags, network_data['request'])
        _subs = []
        certs = []
        requestlist = []

        bad_starts = ["blob", "data"]
        keys_to_delete = []
        for x in network_data['request']:
            if 'response' in network_data['request'][x]:
                request_url = network_data['request'][x]['request']['url']
                response_url = network_data['request'][x]['response']['url']
                if request_url[:4] in bad_starts or response_url[:4] in bad_starts:
                    keys_to_delete.append(x)
                    continue
                if 'securityDetails' in network_data['request'][x]['response']:
                    _ = network_data['request'][x]['response']['securityDetails']
                    _['domain_name'], _['sub_domain'], _['tld'] = enrich.domain_extract(request_url)
                    sub_name = network_data['request'][x]['response']['securityDetails']['subjectName']
                    if sub_name not in _subs:
                        certs.append(network_data['request'][x]['response']['securityDetails'])
                        _subs.append(sub_name)
                requestlist.append(network_data['request'][x])
        for key in keys_to_delete:
            del network_data['request'][key]
        network_data['certificate'] = certs
        network_data['request'] = requestlist
        network_data = Formatting.transform_headers(network_data)
        for x in network_data['certificate']:
            x['valid_from_utc'] = str(datetime.datetime.fromtimestamp(x['validFrom'], datetime.UTC))
            x['valid_to_utc'] = str(datetime.datetime.fromtimestamp(x['validTo'], datetime.UTC))
        network_data['domain'] = enrich.thirdParties(network_data, network_data['resolved_url'])
        network_data['server'] = enrich.server_data(network_data)
        network_data = enrich.scanMeta(network_data)
        network_data['scan_status'] = "success"
        if config['threat_ai']:
            network_data['threat_ai'] = analyze(network_data, config['threat_ai_endpoint'])
    except WebDriverException as e:
        if "unknown error: net::ERR_NAME_NOT_RESOLVED" in str(e):
            logger.critical(f"Not Resolved - {url}")
            network_data['errors'].append({'error': 'ERR_NAME_NOT_RESOLVED', 'url': url})
        elif "unknown error: net::ERR_CONNECTION_REFUSED" in str(e):
            logger.critical(f"Connection Refused - {url}")
            network_data['errors'].append({'error': 'ERR_CONNECTION_REFUSED', 'url': url})
        else:
            network_data['errors'].append({'error': str(e), 'url': url})
        failed += 1
        network_data['scan_status'] = "failed"
    except Exception as e:
        failed += 1
        network_data['scan_status'] = "failed"
        network_data['errors'].append({'error': str(e), 'url': url})
        print('uncaught error')
        print(e)
    finally:
        chrome.quit()
        network_data['completion_utc'] = str(datetime.datetime.now(timezone.utc))[:19]
        end = datetime.datetime.now()
        network_data['scan_time'] = str(end - start)
        # print(json.dumps(network_data, indent=4))
        return network_data


def chunk_list(lst, num_chunks):
    chunk_size = len(lst) // num_chunks
    chunks = [lst[i:i+chunk_size] for i in range(0, len(lst), chunk_size)]
    if len(chunks) > num_chunks:
        chunks[-2] += chunks[-1]
        chunks = chunks[:-1]
    return chunks


def process_chunk(chunk):
    global counter, success, failed, errors, skipped

    for url in chunk:
        if config['skip_if_exists']:
            previously_scanned = OpenSearch.value_exists('submission_url', url, 'scans', 'report_id')
            if previously_scanned:
                logger.info(f'Skipping - Scanned Previously {url} - Previous Report: {previously_scanned}')
                skipped += 1
                counter += 1
                continue

        report = Formatting.clean_data(phuck(url))
        counter += 1

        if report and report['scan_status'] != 'failed':
            success += 1
            report['scan_status'] = 'success'

        if config['community']:
            democracy.save(report)
            return

        elif config['save_elastic']:
            OpenSearch.save_report(report)

            if 'domain' in report:
                for domain in report['domain']:
                    domains.update(domain)

            if 'server' in report:
                for server in report['server']:
                    servers.update(server)



def process_chunks_in_parallel(lst):
    num_threads = int(config['threads'])
    chunks = chunk_list(lst, num_threads)
    threads = []
    for chunk in chunks:
        thread = threading.Thread(target=process_chunk, args=(chunk,))
        thread.start()
        threads.append(thread)
    for thread in threads:
        thread.join()


def main():
    global success, failed, errors, urls, skipped
    start = datetime.datetime.now()

    if not config['queue_worker']:
        if config['source'] == 'query':
            urls = OpenSearch.query(config['elastic_query_index'], config['elastic_query'], config['elastic_size'])
            _urls = []
            for record in urls:
                try:
                    _urls.append(record['fields']['url'])
                except:
                    _urls.append(record['fields']['domain'])
            urls = _urls
        elif config['source'] == 'openphish':
            urls = get_openPhish()
            if not urls:
                return
        elif config['url']:
            logger.debug('Scanning Single URL')
            urls = [config['url'].strip()]
            config['threads'] = 1
            config['source'] = 'url'
        process_chunks_in_parallel(urls)
        engine_log['total'] = success + failed + skipped
        engine_log['success'] = success
        engine_log['failed'] = failed
        engine_log['skipped'] = skipped
        engine_log['completion_utc'] = str(datetime.datetime.now(timezone.utc))[:19]
        engine_log['time'] = str(datetime.datetime.now()-start)
        # engine_log['config'] = config
        if config['save_elastic']:
            OpenSearch.raw_save('engine_log', engine_log, engine_log['engine_id'])
        print(json.dumps(engine_log, indent=4))
    else:
        app.run(host='0.0.0.0', port=5000, debug=True)




if __name__ == '__main__':
    main()
