Prerequis
----------

  $ sudo apt-get install python3-venv

  *You need to have a running instance of postgre installed*

  $ apt install postgresql postgresql-client

  $ su postgresql

  $ service postgresql start

  $ adduser mreport

  $ psql -p 5432 -c "CREATE DATABASE dataviz OWNER mreport;"
 

Install
---------

  Clone the repository

  $ cd /home/mreport

  $ git clone https://github.com/geobretagne/mreport.git

  $ cd mreport

  Create a virtualenv and activate it

  $ python3 -m venv venv

  $ . venv/bin/activate

  Install Flask and dependencies

  $ pip install -r requirements.txt

  *To install requirements, you need to be disconnected from any proxy*


Configure database
---------

$ DATABASE_NAME=dataviz

$ DATABASE_USER=mreport

$ DATABASE_PORT=5432

$ su postgres

$ createuser -p $DATABASE_PORT -P -S -D -R -e $DATABASE_USER

$ createdb -O $DATABASE_USER DATABASE_NAME

$ exit


Configure
---------

  Edit config.py and set and replace DATABASE_VARIABLES by correct values

  * SQLALCHEMY_DATABASE_URI = 'postgresql://DATABASE_USER:DATABASE_PASSWORD@DATABASE_HOST:DATABASE_PORT/DATABASE_NAME'

  *Replace the respective elements with the information of your database*

  The other default configuration parameters are : 

  * API_LOCATION = '/api'
  * APP_SCHEME = 'http'
  * SCHEMA = "data" 
  * MREPORT_REPORTS = "backend/reports"
  * MREPORT_LOCATION = "/mreport"
  * ADMIN_LOCATION = "/admin"

Create database schema and tables
--------------

  $ python createdb.py

Add test data to database
--------------

  $ su postgres

  $ psql -p 5432 -d dataviz --set "schema=data" -f backend/datainit/alimentation.sql

  $ exit

  *schema must = the same as SCHEMA in config.py*

  *To drop the test data from the database use this command*

  $ python emptydb.py


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
