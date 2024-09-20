# Tested with Mistral7b_v0.3 4bit, 8bit & 16bit
import requests

prompts = {
    "ai_resources": "The following json is the resources outputted from a web scan, they may be malicious or benign. The resource type is identified by the key mime_type and the raw resource is stored under raw_data. Analyze the resoures, how they work and any potential security or cybersecurity issues. Also confirm if any network connections are made.",
    "ai_dom": "The following is the document object model from a website, it may be malicious or it may be benign, analyze it from a security standpoint and provide an enterpirse worthy writeup. Make sure to highlight any script behaviours and network activity",
    "ai_requests": "The following json is all the requests made when loading a website. Provide a writeup on the activity that is happening.",
    "ai_page_scripts": "The following are the scripts running on a website, breakdown their behaviour and intepret if there is any security risks"
}


def remove_images(resources):
    to_delete = []

    for resource in resources:
        if 'image' in resources[resource]['mime_type']:
            to_delete.append(resource)
    for resource in to_delete:
        resources.pop(resource, False)
    return resources


def analyze(report, endpoint):
    report_parts = {
        "ai_resources": report.pop('resource_master', False),
        "ai_dom": report.pop('dom', False),
        "ai_requests": report.pop('request', False),
        "ai_page_scripts": report.pop('page_scripts', False)
        }

    results = {}
    for part in report_parts:
        if report_parts[part]:
            prompt = prompts[part]
            if not part == 'ai_resources':
                raw = report_parts[part]
            else:
                raw = remove_images(report_parts[part])
            print(endpoint)
            response = requests.post(endpoint, json={"message": f"""{prompt}\n\n{raw}"""})
            print(response.text)
            if response.status_code == 200:
                results[part] = response.json()['reply']
                print(results[part])

    return results

