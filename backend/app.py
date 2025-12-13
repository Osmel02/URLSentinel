from flask import Flask, request, jsonify, abort
from flask_cors import CORS

from utils.validator import validator_url

from services.virustotal import scan_virustotal
from services.urlscan import urlscan
app = Flask(__name__)
CORS(app)


@app.route('/analyze', methods = ['POST', 'OPTIONS'])
def scan():

    try:
        url = validator_url()

        resultado_vt = scan_virustotal(url)
        resultado_urlscan = urlscan(url)

        return jsonify({
        #    'virustotal': resultado_vt,
            'urlscan': resultado_urlscan
        })


    except Exception as e:
        abort(500, description= f"Error interno: {e}")

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)