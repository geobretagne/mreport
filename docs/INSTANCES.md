# Plusieurs instances mreport sur un même serveur

## Principe

Chaque instance tournera sur un port http particulier en configurant un vhost dédié
ex:
* http://mreport.com:80/admin
* http://mreport.com:82/admin 

Chaque instance dispose d'un service system permettant de fournir l'API qui tournera sur un port dédié (5001, 5002)

## Installations

Pour 2 instances , il faut faire deux clones de mreport
ex:
* /home/mreport/mreport
* /home/mreport/mreport2

Pour chaque clone, installer et configurer l'application comme pour toute installation :
* https://github.com/geobretagne/mreport/blob/master/docs/INSTALL.md#1---create-and-configure-database
* https://github.com/geobretagne/mreport/blob/master/docs/INSTALL.md#install-mreport-application
* https://github.com/geobretagne/mreport/blob/master/docs/INSTALL.md#configure-application
* https://github.com/geobretagne/mreport/blob/master/docs/PRODUCTION.md#create-log-directory

Puis, pour chaque instance (clone mreport), modifier les fichiers suivants :

### Backend
* fichier config.py configuration accès base de données
* fichier server_configurations/apache2/mreport_conf2.conf : remplacer le port 5000 par le port à utiliser (exemple 5000 pour mreport, 5002 pour mreport2)

```
<Location "/api">
    ProxyPass "http://127.0.0.1:5002/api/"
    ProxyPassReverse "http://127.0.0.1:5002/api/"
</Location>
```

### Service
Créer et activer un service par instance en suivant la méthode https://github.com/geobretagne/mreport/blob/master/docs/PRODUCTION.md#create-and-enable-service
et en remplaçant 0.0.0.0:5000 par le port que vous avez défini à l'étape précédente.

### Frontend
Instances servies par apache (un vhost par instance).

``cd /etc/apache2/sites-available``

``wget https://raw.githubusercontent.com/geobretagne/mreport/master/server_configurations/apache2/mreport.conf -O mreport2.conf``

* Modifier pour la deuxième instance <VirtualHost *:80>  par <VirtualHost *:82> si choix du port 82, vérifier que la ligne listen 82 est bien active dans
/etc/apache2/ports.conf
* Modifier la ligne Define MREPORT_LOCATION /home/mreport/mreport pour pointer sur le bon dépôt
* Modifier les 2 lignes AuthUserFile /etc/apache2/.mreport pour pointer vers le bon fichier authentification apache (``sudo htpasswd -c /etc/apache2/.mreport2 demo``)

Exemple de conf Apache :

```
<VirtualHost *:82>
    #ServerName www.mreport.com
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html
    ErrorLog ${APACHE_LOG_DIR}/error_mreport.log
    CustomLog ${APACHE_LOG_DIR}/access_mreport.log combined
    Define MREPORT_LOCATION /home/ckan/mreport2
    Include ${MREPORT_LOCATION}/server_configurations/apache2/mreport_conf2.conf

    <Location "/api">
        AuthType Basic
        AuthName "Restricted Content"
        AuthUserFile /etc/apache2/.mreport2
        <Limit POST PUT DELETE>
          <RequireAll>          
              Require valid-user
          </RequireAll>
        </Limit>
    </Location>
    
    <Location ~ "^/api/($|/$)">
        Require all denied
    </Location>

    <Location ~ "/admin/">
        AuthType Basic
        AuthName "Restricted Content"
        AuthUserFile /etc/apache2/.mreport2
        Require valid-user 
    </Location>    
</VirtualHost>
```

``sudo a2ensite mreport2.conf``

``sudo systemctl reload apache2``
