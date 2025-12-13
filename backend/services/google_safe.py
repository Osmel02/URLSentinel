import requests, os, json
from dotenv import load_dotenv

def scan_google_safe(url):
    api_google = os.getenv('GOOGLE_SAFE_BROWSING_API_KEY')
    url_google = os.getenv('GOOGLE_SAFE_BROWSING_URL')

    headers = {
        'Content-Type': 'application/json',
    }

    payload = {
        "client": {
            "clientId": "urlsentinel",
            "clientVersion": "1.0.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }

    try:
        response = requests.post(f"{url_google}?key={api_google}",
                                 headers=headers,
                                 data=json.dumps(payload)
                                 )

        response.raise_for_status()
        data = response.json()
        print(data)


        if data.get('matches'):
            return {
                "safe": False,
                "threats": [match['threatType'] for match in data['matches']],
                "details": data
            }
        return {"safe": True, "threats": [], "details": data}

    except Exception as e:
        return e
