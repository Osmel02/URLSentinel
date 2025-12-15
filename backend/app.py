from flask import Flask, request, jsonify, abort
from flask_cors import CORS, cross_origin

from utils.validator import validator_url
from utils.correlator import result_correlator

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods = ['POST', 'OPTIONS'])
@cross_origin(origins=['chrome-extension://eehdojlgccffbpfggmnkibmebdflegpm'])
def scan():

    try:
        url = validator_url()
        response_correlator = result_correlator(url)

        return response_correlator


    except Exception as e:
        abort(500, description=f"Error interno: {e}")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)