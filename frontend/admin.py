from flask import Blueprint, render_template

admin = Blueprint('admin', __name__, url_prefix='/admin', template_folder='templates',
                     static_url_path='/static', static_folder='static')

@admin.route('/')
def index():    
    return render_template('admin.html')