import requests, os
from dotenv import load_dotenv
from flask import jsonify


load_dotenv()
def scan_virustotal(url):
    api_key = os.getenv('API_KEY_VIRUSTOTAL')
    url_virustotal = 'https://www.virustotal.com/api/v3/urls'

    headers = {'x-apikey': api_key}
    data = {'url': url}

    try:
        response_scan = requests.post(url=url_virustotal,headers=headers,data=data)
        url_analysis = response_scan.json()['data']['links']['self']

        info_analysis = requests.get(url=url_analysis,headers=headers)
        stats = info_analysis.json()['data']['attributes']['stats']


        if stats.get('malicious',0) > 0:
            return "malicioso"

        elif stats.get('suspicious',0) > 0:
            return "Sospechoso"


    except Exception as e:
        return jsonify({
            'error': True,
            'message': f'Virustotal: {e}'
        })


