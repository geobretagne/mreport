Prerequis
----------

You need to have a running instance of postgres installed

  
Create and configure database with 5 variables
----------------------------------------------

In the next section, you have to replace DATABASE_VARS by your values

On database server (localhost or remote host)

``cd /tmp``

``wget https://raw.githubusercontent.com/geobretagne/mreport/master/backend/datainit/demo.sql``

Set shell variables

 ``sudo su postgres``

 ``DATABASE_HOST=localhost``

 ``DATABASE_PORT=5432``

 ``DATABASE_NAME=dataviz``

 ``DATABASE_USER=mreport_user``

 ``DATABASE_SCHEMA=data``

Create database user

 ``createuser -p $DATABASE_PORT -P -S -D -R -e $DATABASE_USER``

Create database

 ``createdb -O $DATABASE_USER $DATABASE_NAME``

 ``psql -p 5432 -d $DATABASE_NAME -f /tmp/demo.sql --set "user=$DATABASE_USER" --set "schema=$DATABASE_SCHEMA"``


Install system packages
-----------------------

``sudo apt-get install python3-venv git``

Create mreport system user

  ``sudo adduser mreport``

Clone the repository

  ``cd /home/mreport``

  ``sudo su mreport``

  ``git clone https://github.com/geobretagne/mreport.git``


Install mreport application
---------------------------

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

Use the same parameters as used in the database section

For example you used:

 ``DATABASE_HOST=localhost``

 ``DATABASE_PORT=5432``

 ``DATABASE_NAME=dataviz``

 ``DATABASE_USER=mreport_user``

 ``DATABASE_SCHEMA=data``

  *Replace the respective elements with the information of your database*

  The other default configuration parameters in config.py are :

  * API_LOCATION = '/api'
  * APP_SCHEME = 'http'
  * SCHEMA = "data"
  * MREPORT_REPORTS = "backend/reports"
  * MREPORT_LOCATION = "/mreport"
  * ADMIN_LOCATION = "/admin"


Tester frontend & backend
--------------------------

  ``python3 dispatcher.py``

  test http://localhost:5000/api

  test http://localhost:5000/admin/

  test http://localhost:5000/mreport/epci_population/243500139


Or to independently test the frontend
--------------

 ``cd /home/mreport/mreport``
 
 ``sudo su mreport``
 
 ``. venv/bin/activate`` 

  ``export FLASK_APP=frontend``

  ``flask run``

  test http://localhost:5000/mreport/epci_population/243500139

  test http://localhost:5000/admin/


Or to independently test the backend
--------------

  ``export FLASK_APP=backend``

  ``flask run``

  test http://localhost:5000/api



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
