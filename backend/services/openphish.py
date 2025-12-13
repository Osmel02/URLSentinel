import requests, os
from dotenv import load_dotenv

load_dotenv()
url_openphish = os.getenv('URL_OPENPHISH')

def scan_op(url):
    try:
        response = requests.get(url_openphish)
        url_set = set(line.strip() for line in response.text.splitlines() if line.strip())

        if url in url_set:
            return True
        else:
            return False

    except Exception as e:
        return e