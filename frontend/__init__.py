# -*- coding: utf-8 -*-
from flask import Flask
from frontend.admin import admin
from frontend.mreport import mreport

#def create_app(test_config=None):
app = Flask(__name__)
app.register_blueprint(admin)
app.register_blueprint(mreport)

#   return app
