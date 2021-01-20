Prerequis
----------

  $ sudo apt-get install python3-venv

  *You need to have a running instance of postgre installed, with a user and an empty database*

  $ apt install postgresql postgresql-client
  $ su postgresql
  $ service postgresql start
  $ adduser mreport
  $ psql -p 5432 -c "CREATE DATABASE dataviz OWNER mreport;"
 

Install
---------

  Clone the repository

  $ cd /home
  $ git clone https://github.com/geobretagne/mreport.git
  $ cd mreport

  Create a virtualenv and activate it

  $ python3 -m venv venv
  $ . venv/bin/activate

  Install Flask and dependencies

  $ pip install -r requirements.txt

  *To install requirements, you need to be disconnected from any proxy*

Configure
---------

  Edit config.py and set

  * SQLALCHEMY_DATABASE_URI = 'postgresql://mreport:password@localhost:5432/dataviz'

  *Replace the respective elements with the information of your database*

  The other default configuration parameters are : 

  * API_LOCATION = '/api'
  * APP_SCHEME = 'http'
  * SCHEMA = "data" 
  * MREPORT_REPORTS = "backend/reports"
  * MREPORT_LOCATION = "/mreport"
  * ADMIN_LOCATION = "/admin"

Create database
--------------
  $ python createdb.py

Add test data to database
--------------
  $ su postgres
  $ psql -p 5432 -d dataviz --set "schema=data" -f backend/datainit/alimentation.sql
  $ exit

  *schema must = the same as SCHEMA in config.py*

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


Tester frontend & backend
--------------------------
  $ python3 dispatcher.py

  test http://localhost:5000/api
  test http://localhost:5000/admin/
  test http://localhost:5000/mreport/sample/ECLUSE_1

Gunicorn
--------

  $ gunicorn -b 0.0.0.0:5000 dispatcher

 ```Create a .service file for the api. (/etc/systemd/system/mreport.service):```

```
[Unit]
Description=mreport
After=network.target

[Service]
User=mreport
Restart=on-failure
WorkingDirectory=/tmp/
ExecStart=/home/mreport/mreport/venv/bin/gunicorn -b 0.0.0.0:5000 dispatcher

[Install]
WantedBy=multi-user.target
```


```Enable and start the service```

    $ sudo systemctl daemon-reload
    $ sudo systemctl enable mreport
    $ systemctl start mreport
