import validators
from flask import abort, request
def validator_url():
    if not request.is_json:
        abort(415, description="Invalid input")

    data = request.get_json()

    if len(data) != 1:
        abort(400, description="Invalid input")

    if not data or 'url' not in data:
        abort(400, description='Invalid input')

    url = data['url']

    if not isinstance(url,str):
        abort(400, description='Invalid format')

    if not url:
        abort(400, description="Invalid input")

    if not validators.url(url):
        abort(400, description="Invalid input")
    else:
        return url
