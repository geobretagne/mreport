# Plusieurs instances mreport sur un même serveur

## Principe
pour 2 instances , il faut faire deux clones de mreport
ex:
* /home/mreport/mreport
* /home/mreport/mreport2

Chaque instance tournera sur un port http particulier en configurant un vhost dédié
ex:
* http://mreport.com:80
* http://mreport.com:82 

Chaque instance dispose d'un service system permettant de fournir l'API qui tournera sur un port dédié (5001, 5002)


Pour chaque instance (clone mreport), modifier les fichiers suivants

### Backend
* fichier config.py configuration accès base de données
* fichier server_configurations/apache2/mreport_conf2.conf : remplacer le port 5000 par le port à utiliser (exemple 5000 pour mreport, 5002 pour mreport2)


### Service
Créer et activer un service par instance en suivant la méthode https://github.com/geobretagne/mreport/blob/master/docs/PRODUCTION.md#create-and-enable-service
et en remplaçant 0.0.0.0:5000 par le port que vous avez défini à l'étape précédente

### Frontend
Instances servies par apache (un vhost par instance)

``cd /etc/apache2/sites-available``

``wget  -O mreport2.conf https://raw.githubusercontent.com/geobretagne/mreport/master/server_configurations/apache2/mreport.conf``

Modifier si nécessaire <VirtualHost *:80>  par <VirtualHost *:82> si choix du port 82, vérifier que la ligne listen 82 est bien active dans
/etc/apache2/ports.conf 
modifier la ligne Define MREPORT_LOCATION /home/mreport/mreport2 pour pointer sur le bon dépôt

``sudo a2ensite mreport2.conf``

``sudo systemctl reload apache2``


