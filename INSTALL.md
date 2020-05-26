Prerequis
----------

    $ sudo apt-get install python3-venv
 
 
Install
---------

    # clone the repository
    $ cd /home
    $ git clone https://github.com/geobretagne/mreport.git
    $ cd mreport


Create a virtualenv and activate it

    $ python3 -m venv venv
    $ . venv/bin/activate


Install Flask and dependencies

    $ pip install -r requirements.txt



Configure
---------

Edit config.py and set SQLALCHEMY_DATABASE_URI



Test frontend
--------------

    $ export FLASK_APP=frontend
    $ flask run
    
    test http://localhost:5000/mreport/sample/ECLUSE_1
    
    test http://localhost:5000/admin/
    
Test backend
--------------

    $ export FLASK_APP=backend
    $ flask run
    
    test http://localhost:5000/api
    
    