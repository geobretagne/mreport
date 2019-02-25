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

### DATA STRUCTURE

#### CSV

dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | viz_2 | 1 | 1 | 9h-10h | 28	
ECLUSE_1 | viz_2 | 1 | 2 | 10h-11h |72	
ECLUSE_1 | viz_2 | 1 | 3 | 11h-12h | 81	
ECLUSE_1 | viz_2 | 1 | 4 | 12h-13h | 38	
ECLUSE_1 | viz_2 | 1 | 5 | 13h-14h | 16	
ECLUSE_1 | viz_2 | 1 | 6 | 14h-15h | 59	
ECLUSE_1 | viz_2 | 1 | 7 | 15h-16h | 53	
ECLUSE_1 | viz_2 | 1 | 8 | 16h-17h | 61	
ECLUSE_1 | viz_2 | 1 | 9 | 17h-18h | 45	
ECLUSE_1 | viz_2 | 1 | 10 | 18h-19h | 18	
ECLUSE_1 | viz_2 | 1 | 11 | 19h-20h | 1




### PRINCIPE

Each report stored in mviewer/reports is a folder containing :

* Required `config.json` which is the configuration file
* Required `report.html` which is the html strutured document to render report
