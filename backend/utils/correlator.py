from flask import jsonify

from services.virustotal import scan_virustotal
from services.urlscan import urlscan
from services.openphish import scan_op


def result_correlator(url):
    #resultado_vt = scan_virustotal(url)
    resultado_urlscan = urlscan(url)
    resultado_op = scan_op(url)

    if resultado_urlscan is bool and resultado_op is bool:
        print("Hello Word")


