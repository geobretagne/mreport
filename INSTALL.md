Prerequis
----------

  *You need to have a running instance of postgre installed*

  $ sudo apt-get install python3-venv git


Clone repository
----------------
Create mreport system user
  ``sudo adduser mreport``

Clone the repository

  ``cd /home/mreport``

  ``sudo su mreport``

  ``git clone https://github.com/geobretagne/mreport.git``

  ``exit``

Configure database with 5 variables
-----------------------------------

For example:

  ```
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_NAME=dataviz
  DATABASE_USER=mreport_user
  DATABASE_PASSWORD=changeit
  ```

In the next section, you have to replace DATABASE_VARS by your values

On mreport server, edit /home/mreport/mreport.config.py and set SQLALCHEMY_DATABASE_URI variable

  ``SQLALCHEMY_DATABASE_URI = 'postgresql://DATABASE_USER:DATABASE_PASSWORD@DATABASE_HOST:DATABASE_PORT/DATABASE_NAME'``


On database server (localhost or remote host)

Set shell variables

 ``sudo su postgres``

 ``DATABASE_HOST=localhost``

 ``DATABASE_PORT=5432``

 ``DATABASE_NAME=dataviz``

 ``DATABASE_USER=mreport_user``

Create database user

 ``createuser -p $DATABASE_PORT -P -S -D -R -e $DATABASE_USER``

Create database

 ``createdb -O $DATABASE_USER $DATABASE_NAME``


Install mreport application
---------------------------

``sudo su mreport``

`` cd /home/mreport/mreport``

Create a virtualenv and activate it

  ``python3 -m venv venv``

  ``. venv/bin/activate``

Install Flask and dependencies

  ``pip install -r requirements.txt``

*To install requirements, you need to be disconnected from any proxy*


Configure
---------

  Edit config.py and set and be sure that DATABASE_VARIABLES are correctly set in the next variable

  * SQLALCHEMY_DATABASE_URI = 'postgresql://DATABASE_USER:DATABASE_PASSWORD@DATABASE_HOST:DATABASE_PORT/DATABASE_NAME'

  *Replace the respective elements with the information of your database*

  The other default configuration parameters are :

  * API_LOCATION = '/api'
  * APP_SCHEME = 'http'
  * SCHEMA = "data"
  * MREPORT_REPORTS = "backend/reports"
  * MREPORT_LOCATION = "/mreport"
  * ADMIN_LOCATION = "/admin"

Create database schema and tables and add demo data to database
------------------------------------

  ``python createdb.py``

  *To drop the test data from the database use this command*

  ``python emptydb.py``


import demo data
-----------------

On database server (localhost or remote host). If remote host copy /home/mreport/mreport/backend/datainit/demo.sql on remote.


 ``sudo su postgres``

 ``psql -p 5432 -d dataviz -f /home/mreport/mreport/backend/datainit/demo.sql``


Test frontend
--------------

 ``cd /home/mreport/mreport``
 
 ``sudo su mreport``
 
 ``. venv/bin/activate`` 

  ``export FLASK_APP=frontend``

  ``flask run``

  test http://localhost:5000/mreport/epci_population/243500139

  test http://localhost:5000/admin/


Test backend
--------------

  ``export FLASK_APP=backend``

  ``flask run``

  test http://localhost:5000/api


Tester frontend & backend
--------------------------

  ``python3 dispatcher.py``

  test http://localhost:5000/api

  test http://localhost:5000/admin/

  test http://localhost:5000/mreport/epci_population/243500139


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
