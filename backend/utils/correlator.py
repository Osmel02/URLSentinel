from flask import jsonify

from services.virustotal import scan_virustotal
from services.urlscan import urlscan
from services.openphish import scan_op


def result_correlator(url):
    r_vt = scan_virustotal(url)
    resultado_vt = r_vt if isinstance(r_vt, bool) else None

    r_uc = urlscan(url)
    resultado_urlscan = r_uc if isinstance(r_uc, bool) else None

    r_op = scan_op(url)
    resultado_op = r_op if isinstance(r_op, bool) else None

    return jsonify({
        "VIRUSTOTAL": resultado_vt,
        "URLSCAN": resultado_urlscan,
        "OPENPHISH": resultado_op
    })


