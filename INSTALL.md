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
    

    
Tester frontend & backend
--------------------------

    $ python3 dispatcher.py
    
    test http://localhost:5000/api
    test http://localhost:5000/admin/
    test http://localhost:5000/mreport/sample/ECLUSE_1
    

gunicorn
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
    