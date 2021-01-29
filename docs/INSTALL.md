# MREPORT INSTALL

## Prerequis

You need to have a running instance of postgres installed

  
## 1 - Create and configure database

Download sql dump on database server (localhost or remote host)

``cd /tmp``

``wget https://raw.githubusercontent.com/geobretagne/mreport/master/backend/datainit/demo.sql``

Become postgres user

 ``sudo su postgres``
 
##### Set DATABASE VARIABLES

 ```
 DATABASE_HOST=localhost 
 DATABASE_PORT=5432 
 DATABASE_NAME=dataviz 
 DATABASE_USER=mreport_user 
 DATABASE_SCHEMA=data
 ```

Create database user

 ``createuser -p $DATABASE_PORT -P -S -D -R -e $DATABASE_USER``

Create database

 ``createdb -O $DATABASE_USER $DATABASE_NAME``
 
Create database schema and populate it with demo data

 ``psql -p 5432 -d $DATABASE_NAME -f /tmp/demo.sql --set "user=$DATABASE_USER" --set "schema=$DATABASE_SCHEMA" -T template0 -E 'UTF8'``



## 2 - Install application

On mreport server, install system packages

``sudo apt-get install python3-venv git``

### Clone repository

Create mreport system user

 ``sudo adduser mreport``

Clone the repository

 ``cd /home/mreport``

 ``sudo su mreport``

 ``git clone https://github.com/geobretagne/mreport.git``


### Install mreport application

``cd /home/mreport/mreport``

Create a virtualenv and activate it

  ``python3 -m venv venv``

  ``. venv/bin/activate``

Install Flask and dependencies

``pip install wheel``

``pip install -r requirements.txt``

*To install requirements, you need to be disconnected from any proxy*


### Configure

Edit config.py and set and be sure that DATABASE_VARIABLES are correctly set in the next variable

* ```SQLALCHEMY_DATABASE_URI = 'postgresql://[DATABASE_USER]:[DATABASE_PASSWORD]@[DATABASE_HOST]:[DATABASE_PORT]/[DATABASE_NAME]'```
  
Example :

* ```SQLALCHEMY_DATABASE_URI = 'postgresql://mreport_user:abcdef@localhost:5432/dataviz'```

Use the same parameters as used in the [database section !](#set-database-variables)

  The other default configuration parameters in **config.py** are :
  
```
  * API_LOCATION = '/api'
  * APP_SCHEME = 'http'
  * SCHEMA = "data"
  * MREPORT_REPORTS = "backend/reports"
  * MREPORT_LOCATION = "/mreport"
  * ADMIN_LOCATION = "/admin"
```


### Test frontend & backend

  ``python3 dispatcher.py``

  test http://localhost:5000/api

  test http://localhost:5000/admin/

  test http://localhost:5000/mreport/epci_population/243500139
  
### Production mode

See [PRODUCTION.md](docs/PRODUCTION.md)
