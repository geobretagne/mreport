# TODO

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
