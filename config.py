from os import getenv
DEBUG = True
API_LOCATION = '/api'
APP_SCHEME = 'http'
DB_USER = getenv('MREPORT_DATABASE_USER', 'mreport_user')
DB_PWD = getenv('MREPORT_DATABASE_PWD', 'mreport_password')
DB_HOST = getenv('MREPORT_DATABASE_HOST', 'localhost')
DB_PORT = getenv('MREPORT_DATABASE_HOST_PORT', '5432')
DB_NAME = getenv('MREPORT_DATABASE_NAME', 'dataviz')
SCHEMA = getenv('MREPORT_DATABASE_SCHEMA', 'data')
SQLALCHEMY_DATABASE_URI = 'postgresql://%s:%s@%s:%s/%s' % (DB_USER, DB_PWD, DB_HOST, DB_PORT, DB_NAME)
SQLALCHEMY_TRACK_MODIFICATIONS = False
MREPORT_REPORTS = "backend/reports"
MREPORT_LOCATION = "/mreport"
ADMIN_LOCATION = "/admin"
