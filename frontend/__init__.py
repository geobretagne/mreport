# -*- coding: utf-8 -*-
from flask import Flask
from frontend.admin import admin
from frontend.mreport import mreport

#def create_app(test_config=None):
app = Flask(__name__)
app.config.from_object('config')
app.config['JSON_AS_ASCII'] = False
app.register_blueprint(admin, url_prefix=app.config['ADMIN_LOCATION'])
app.register_blueprint(mreport, url_prefix=app.config['MREPORT_LOCATION'])

#   return app
