import os, requests
from flask import jsonify
import time

from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('API_KEY_URLSCAN')

def urlscan(url):
    url_d = 'https://urlscan.io/api/v1/scan'
    headers = {
        'API-Key': api_key
    }
    payload = {
        "url": url,
        "visibility": "public",
        "country": "de",
        "tags": [
            "iloveurlscan",
            "testing"
        ]
    }
    try:
        response = requests.post(url_d, headers=headers, json=payload)
        data_id = response.json()['uuid']

        time.sleep(40)
        scan_id = data_id

        url_r = "https://urlscan.io/api/v1/result/" + scan_id + "/"
        headers = {"api-key": api_key}

        response = requests.get(url_r, headers=headers)
        data = response.json()["verdicts"]["urlscan"]['malicious']

        return data

    except Exception as e:
        return e