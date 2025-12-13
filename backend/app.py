from flask import Flask, request, jsonify, abort
from flask_cors import CORS

from utils.validator import validator_url

from services.virustotal import scan_virustotal
from services.urlscan import urlscan
from services.openphish import scan_op
from services.google_safe import scan_google_safe

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods = ['POST', 'OPTIONS'])
def scan():

    try:
        url = validator_url()

#        resultado_vt = scan_virustotal(url)
#        resultado_urlscan = urlscan(url)
#        resultado_op = scan_op(url)
        resultado_google = scan_google_safe(url)
        print(resultado_google)
#        return jsonify({
#            'virustotal': resultado_vt,
#            'urlscan': resultado_urlscan,
#            'openphish': resultado_op
#
#        })
        return jsonify({'q':1})

    except Exception as e:
        abort(500, description=f"Error interno: {e}")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)