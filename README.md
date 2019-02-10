# mreport
Simple report generator with simple dataviz


### API

/mreport/#myreport?dataid=1&dataviz=2

Where 
* `myreport` corresponds to real folder equals /mreport/reports/myreport
* `dataid` corresponds to data id in source data
* `dataviz` correspondst to dataviz representation defined in report

### DATAVIZ

5 Dataviz types

Dataviz | Description
--------|------------
chart | Chart ChartJs (line, bar, doughnut, pie ...)
figure | Chiffre clé (key figure)
map | Carte
table | Tableau
title | Titre du document

### DATASOURCE

Json file or csv file.
