# MREPORT DOCKER INSTALL

## Prerequis

You need to have a running instance of DOCKER and DOCKER-COMPOSE installed.

## 1 - Clone repository

``git clone https://github.com/geobretagne/mreport.git``


## 2 - Configure Environnement

``cd mreport``

Edit .env file at the root of the project by replacing 'YOURPASSWORD' by your passwords

## 3 - Construct and Start services

``sudo docker-compose up --build -d``