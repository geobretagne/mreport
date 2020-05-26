# api-mreport
flask api for mreport

Prerequis
----------

    $ sudo apt-get install python3-venv
 
 Create api user
 ---------------
 
    $ sudo adduser mreport


Install
---------

    # clone the repository
    $ cd /home/mreport
    $ git clone https://github.com/spelhate/api-mreport.git
    $ cd api-mreport


Create a virtualenv and activate it

    $ python3 -m venv venv
    $ . venv/bin/activate


Install Flask and dependencies

    $ pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt



Configure
---------

Edit config.py and set SQLALCHEMY_DATABASE_URI



Run
---

    $ export FLASK_APP=app
    $ flask run


Deploy with apache and gunicorn
--------------------------------

In apache conf

```
ProxyPreserveHost on
<Location "/api">
	 Header set Access-Control-Allow-Origin "*"
	 Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"
         ProxyPass "http://127.0.0.1:5000/api/"
	 ProxyPassReverse "http://127.0.0.1:5000/api/"
</Location>
```

logs

    $ mkdir /var/log/api-mreport
    $ sudo chown mreport /var/log/api-mreport



Test gunicorn


    $ gunicorn -c gunicorn.conf -b 0.0.0.0:5000 app:app
    
 ```Create a .service file for the api. (/etc/systemd/system/api-mreport.service):```

```
[Unit]
Description=api-mreport
After=network.target

[Service]
User=mreport
Restart=on-failure
WorkingDirectory=/home/mreport/api-mreport/
ExecStart=/home/mreport/api-mreport/venv/bin/gunicorn -c /home/mreport/api-mreport/gunicorn.conf -b 0.0.0.0:5000 app:app

[Install]
WantedBy=multi-user.target
```


```Enable and start the service```

    $ sudo systemctl daemon-reload
    $ sudo systemctl enable api-mreport
    $ systemctl start api-mreport
 
 
