import json
from datetime import datetime
import requests

community_url = 'https://community.webamon.co.uk'


class Democracy:
    def __init__(self, config):
        self.config = config
        self.apikey = config['webamon_apikey']
        self.headers = {'x-api-key': self.apikey}

    def check_resources_existence(self, resource_list) -> dict | bool:
        sha256_list = list(set([resource['sha256'] for resource in resource_list]))
        response = requests.post(f'{community_url}/resource-check', verify=False, headers=self.headers, json={"sha256_list": sha256_list})
        if response.status_code == 403:
            print('Invalid API Key - Unauthorized')
            return False
        return response.json()['resources']

    def save_new_resources(self, resource_master, new_resources):
        date = datetime.utcnow().strftime("%Y-%m-%d")
        for sha256 in new_resources:
            mime = resource_master[sha256]['mime_type']
            raw = resource_master[sha256]['raw_data']
            data = {"date": date, "resource": raw, "mime_type": mime, 'sha256': sha256}
            if ('css' or 'image') not in mime:
                response = requests.post(f'{community_url}/save-resource', headers=self.headers, json=data)
                if response.status_code == 403:
                    print('Invalid API Key - Unauthorized')
                    return False
                elif response.status_code == 400:
                    print(response.json())
                    return False
        return True

    def save_report(self, report):
        response = requests.post(f'{community_url}/save-report', verify=False, headers=self.headers, json=report)
        if response.status_code == 403:
            print('Invalid API Key - Unauthorized')
            return False
        elif response.status_code == 400:
            print(response.json())
            return False
        return response.json()

    def save(self, report):
        resources = report.pop('resource_master', False)
        resource_meta = report['resource']
        if resources and resource_meta:
            check_exists = self.check_resources_existence(resource_meta)
            if check_exists:
                new = [resource['sha256'] for resource in check_exists if not resource['exists']]
                print(new)
                save_new = self.save_new_resources(resources, new)

        success = self.save_report(report)
        if success:
            print(success)
            return True
        print('Something happened saving the report')
        return False