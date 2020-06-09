from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.serving import run_simple
from frontend import app as front
from backend import app as back
from config import API_LOCATION

application = DispatcherMiddleware(front, {API_LOCATION: back })

if __name__ == '__main__':
    run_simple(
        hostname='localhost',
        port=5000,
        application=application,
        use_reloader=True,
        use_debugger=True,
        use_evalex=True)