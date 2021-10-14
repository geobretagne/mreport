# MREPORT in production mode

In this part of documentation we will see how to configure mreport to :

 * manage backend with system service
 * serve backend and frontend on port 80 or 443 with apache
 * serve frontend with apache instead of flask
 * Restrict admin access of backend


## Prerequis

Mreport installed as detailed in [INSTALL.md](INSTALL.md)

Apache2 installed (or an other server web)
Extension proxy_http 

``sudo a2enmod proxy_http && systemctl restart apache2``

## Manage backend with system service

### Create log directory

``sudo mkdir /var/log/api-mreport``

``sudo chown mreport:mreport /var/log/api-mreport``


### Configure gunicorn

Create file /home/mreport/mreport/gunicorn.conf with following content

```
accesslog = "/var/log/api-mreport/mreport.log"
errorlog = "/var/log/api-mreport/mreport_error.log"
```

``sudo chown mreport:mreport /home/mreport/mreport/gunicorn.conf``

### Create and enable service

Create file /etc/systemd/system/api-mreport.service with following content

```
[Unit]
Description=api-mreport
After=network.target

[Service]
User=mreport
WorkingDirectory=/home/mreport/mreport
ExecStart=/home/mreport/mreport/venv/bin/gunicorn -c /home/mreport/mreport/gunicorn.conf -b 0.0.0.0:5000 backend:app

[Install]
WantedBy=multi-user.target
```

Enable and start service

``sudo systemctl daemon-reload``

``sudo systemctl enable api-mreport``

``sudo systemctl start api-mreport``


## Serve backend and frontend on port 80 or 443 with apache proxy

In this part of documantation we will configure apache to serve mreport frontend instead of Flask

Frontend can be served by apache instead of Flask by using special configuration.

### serve frontend with apache and restrict admin access

#### Create authenticated admin user for apache

``sudo htpasswd -c /etc/apache2/.mreport admin``

You will be asked to supply and confirm a password for the admin user.

#### create apache configuration

The next apache configuration will :

 * Serve mreport api at /api
 * Serve mreport frontend with apache including dedicated configuration (mreport_conf2.conf)
 * Restrict /api access in PUT DELETE POST Method to authenticated admin user
 * Disable /api root access
 * Restrict /admin access to authenticated admin user

Create this content in your apache installation and enable it

```
Define MREPORT_LOCATION /home/mreport/mreport
Include ${MREPORT_LOCATION}/server_configurations/apache2/mreport_conf2.conf

<Location "/api">
    AuthType Basic
    AuthName "Restricted Content"
    AuthUserFile /etc/apache2/.mreport
    <Limit POST PUT DELETE>
      <RequireAll>          
          Require valid-user
      </RequireAll>
    </Limit>
</Location>
<Location ~ "^/api($|/$)">
    Require all denied
</Location>

<Location ~ "/admin/">
    AuthType Basic
    AuthName "Restricted Content"
    AuthUserFile /etc/apache2/.mreport
    Require valid-user 
</Location>
```
