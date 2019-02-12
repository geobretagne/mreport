# mreport
Simple report generator with simple dataviz


### API

/mreport/#myreport?dataid=1&dataviz=2

Where 
* `myreport` corresponds to real folder equals /mreport/reports/myreport
* `dataid` corresponds to data id in source data
* `dataviz` correspondst to dataviz representation defined in report

### DATAVIZ

8 Dataviz types

Dataviz | Description
--------|------------
chart | Chart ChartJs (line, bar, doughnut, pie ...)
figure | Chiffre clé (key figure)
map | Carte
table | Tableau
title | Titre du document
text | Texte, résumé, description
image | Picture, Image, Photo
iframe | Embeded content, Iframe

### DATASOURCE

Json file or csv file.


### PRINCIPE

Each report stored in mviewer/reports is a folder containing :

* Required `config.json` which is the configuration file
* Required `report.html` which is the html strutured document to render report
