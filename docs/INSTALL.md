# MREPORT INSTALL

## Prerequis

You need to have a running instance of postgres installed and this process is for Linux systems.


## 1 - Create and configure database

Download sql dump on database server (localhost or remote host)

``cd /tmp``

``wget https://raw.githubusercontent.com/geobretagne/mreport/master/backend/datainit/demo.sql``

Become postgres user

 ``sudo su postgres``

##### Set DATABASE VARIABLES

 ```
 MREPORT_DATABASE_HOST=localhost
 MREPORT_DATABASE_HOST_PORT=5432
 MREPORT_DATABASE_NAME=dataviz
 MREPORT_DATABASE_USER=mreport_user
 MREPORT_DATABASE_SCHEMA=data
 ```

Create database user with password (Enter it to times at prompt).

 ``createuser -p $MREPORT_DATABASE_HOST_PORT -P -S -D -R -e $MREPORT_DATABASE_USER``

Create database

 ``createdb -p $MREPORT_DATABASE_HOST_PORT -O $MREPORT_DATABASE_USER $MREPORT_DATABASE_NAME -T template0 -E 'UTF8'``

Create database schema and populate it with demo data

 ``psql -p $MREPORT_DATABASE_HOST_PORT -d $MREPORT_DATABASE_NAME -f /tmp/demo.sql --set "user=$MREPORT_DATABASE_USER" --set "schema=$MREPORT_DATABASE_SCHEMA"``

 Logout postgres user

 ``exit``



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

*To install wheel and requirements, you need to be disconnected from any proxy*


### Configure application

Edit config.py and set and be sure that MREPORT_DATABASE_VARIABLES are correctly set in the next variable

```
* DB_USER = getenv('MREPORT_DATABASE_USER', 'mreport_user')
* DB_PWD = getenv('MREPORT_DATABASE_PWD', 'yoursecretpassword')
* DB_HOST = getenv('MREPORT_DATABASE_HOST', 'localhost')
* DB_PORT = getenv('MREPORT_DATABASE_HOST_PORT', '5432')
* DB_NAME = getenv('MREPORT_DATABASE_NAME', 'dataviz')
* SCHEMA = getenv('MREPORT_DATABASE_SCHEMA', 'data')
```


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


### Launch application in dev or test mode

mreport backend and frontend can be served by flask at same time with the following command

with **mreport** user in ~/mreport folder with **venv** activated

  ``python3 dispatcher.py``

  or

  ``sudo su mreport``

  ``cd ~/mreport && . venv/bin/activate && python3 dispatcher.py``



### Test application in your web browser

Replace localhost by your hostname if instalation is not on your localhost

  test http://localhost:5000/api

  test http://localhost:5000/admin/

  test http://localhost:5000/mreport/epci_population/243500139

### Launch application in production mode

See [PRODUCTION.md](PRODUCTION.md)
