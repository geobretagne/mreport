from flask import Blueprint, render_template, send_from_directory, abort

mreport = Blueprint('mreport', __name__, url_prefix='/mreport', template_folder='templates',
                     static_url_path='/static', static_folder='static')

#COMMON INDEX.HTML
@mreport.route('/<report>')
@mreport.route('/<report>/<dataid>')
@mreport.route('/<report>/<dataid>/<dataviz>')
def show_report_dataviz(report, dataid=None, dataviz=None):
    # show the report
    options = {"report": report, "base_url": "/mreport"}
    if (dataid):
        options["dataid"] = dataid
    if (dataviz):
         options["dataviz"] = dataviz
    return render_template('index.html', options=options)


# SPECIFIED RESSOURCES FOR EACH REPORT
@mreport.route('/<report>/config.json')
@mreport.route('/<report>/<dataid>/config.json')
def send_config(report, dataid=None):
    return send_from_directory('../backend/reports/%s' % report, 'config.json')

@mreport.route('/<report>/report.html')
@mreport.route('/<report>/<dataid>/report.html')
def send_html(report, dataid=None):
    return send_from_directory('../backend/reports/%s' % report, 'report.html')

@mreport.route('/<report>/report.css')
@mreport.route('/<report>/<dataid>/report.css')
def send_css(report, dataid=None):
    return send_from_directory('../backend/reports/%s' % report, 'report.css')

@mreport.route('/<report>/data.csv')
@mreport.route('/<report>/<dataid>/data.csv')
def send_data(report, dataid=None):
    return send_from_directory('../backend/reports/%s' % report, 'data.csv')