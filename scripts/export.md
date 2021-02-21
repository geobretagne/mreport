# Création d'un fichier demo.sql contenant la structure de la base de données plus les données associées aux rapports sélectionnés.

Le script est à exécuter depuis la machine contenant la base de données MREPORT. Il requiert la présence du fichier export.sql.

## Usage

Des variables sont éventuellement à modifier dans le fichier export.sh

```
PORT=5432
SCHEMA=data
DBSOURCE=dataviz
DBTEMP=dataviz_demo
WKS=/tmp
USER=dataviz_user
```

`su postgres`

`./export.sh rapport1 rapport2 rapportn`

Le script produit un fichier /tmp/demo.sql en sortie avec 2 variables (:schema & :user)



