# mreport

mreport est un outil simple de **reporting web** qui permet de composer des rapports combinant **chiffres-clés**, **graphiques**, **images**, **textes** à partir de jeux de données intégrés dans la base de données de la solution. Un même rapport peut être valable pour un référentiel de localisation (Communes, EPCI,  gares...)

Les rapports générés restent "connectés"   aux données sources et sont affichables sur mobile, ordinateur et imprimables au format A4 pour un export pdf par exemple.

Outre l'aspect reporting, mreport dispose d'une **API** permettant de réutiliser les dataviz disponibles dans un rapport et de les intégrer dans un autre outil web ou un CMS.


### API

`/mreport/monrapport`  :  affiche la liste des localisants disponibles pour ce monrapport

`/mreport/monrapport/unlocalisant`  :  affiche le rapport  monrapport pour un localisant donné

`/mreport/monrapport/unlocalisant/madataviz`  :  affiche la dataviz  disponible dans monrapport pour un localisant donné



### DATAVIZ  DISPONIBLES

8 types de représentations sont disponibles



Dataviz | Description
--------|------------
chart | Graphiquet ChartJs (line, bar, doughnut, pie ...)
figure | Chiffre clé (key figure)
map | Carte
table | Tableau
title | Titre du rapport
text | Texte, résumé, description
image |  Image, Photo
iframe | Contenu embarqué, Iframe






### DATA STRUCTURE

A chaque localisant  (commune , gare...)  - **dataid**- est associé une ou plusieurs représentations - **dataviz** -
Chaque dataviz  contient une ou plusieurs séries de données - **dataset** - composées elles mêmes d'une ou plusieurs valeurs (**data** + **label**) ordonnées - **order**.

  Exemple

dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
feature_1 | figure_1 | 1 | 1 | chiens | 28
feature_1 | figure_2 | 1 | 1 | chats | 72
feature_2 | figure_1 | 1 | 1 | chiens | 28
feature_2 | figure_2 | 1 | 1 | chats | 72


**Title sample** dataset & data & order are not used

dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | title | 1 | 1 |ECLUSE N°1 |



**Text sample** dataset & order are not used


dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | text_1 | 1 | 1 | Descriptif 1 | Lorem ipsum dolor sit amet. consectetur adipiscing elit. Ut id urna faucibus. blandit tellus a. aliquet massa. Vivamus non mollis arcu. Phasellus nec sem eget massa fa...




**Chart sample** one dataset


dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | chart_1 | 1 | 1 | 9h-10h | 28
ECLUSE_1 | chart_1 | 1 | 2 | 10h-11h |72
ECLUSE_1 | chart_1 | 1 | 3 | 11h-12h | 81
ECLUSE_1 | chart_1 | 1 | 4 | 12h-13h | 38
ECLUSE_1 | chart_1 | 1 | 5 | 13h-14h | 16
ECLUSE_1 | chart_1 | 1 | 6 | 14h-15h | 59
ECLUSE_1 | chart_1 | 1 | 7 | 15h-16h | 53
ECLUSE_1 | chart_1 | 1 | 8 | 16h-17h | 61
ECLUSE_1 | chart_1 | 1 | 9 | 17h-18h | 45
ECLUSE_1 | chart_1 | 1 | 10 | 18h-19h | 18
ECLUSE_1 | chart_1 | 1 | 11 | 19h-20h | 1


![chart_1](img/chart_1.png?raw=true  "chart_1")


**Table sample** one dataset is a column content


dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | table_1 | 1 | 1 | Mois | Janvier |
ECLUSE_1 | table_1 | 2 | 1 | Passage | 12 |
ECLUSE_1 | table_1 | 1 | 2 | Mois | Février |
ECLUSE_1 | table_1 | 2 | 2 | Passage | 22 |
ECLUSE_1 | table_1 | 1 | 3 | Mois | Mars |
ECLUSE_1 | table_1 | 2 | 3 | Passage | 222


![table_1](img/table_1.png?raw=true  "table_1")

**Figure sample** - dataset & order are not used

dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | figure_1 | 1 | 1 | Nombre total de passage de bâteaux | 483


**Map sample** - One marker type by dataset - Data is WKT POINT.

dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | map_1 | point_1 | 1 | ECLUSE N°1a | POINT(-1.5, 48.2)
ECLUSE_1 | map_1 | point_1 | 2 | ECLUSE N°1b | POINT(-1.55, 48.25)

![map_1](img/map_1.png?raw=true  "map_1")

**Image sample** - dataset & order are not used

dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | image_1 | 1 | 1 | Image 1 | http://kartenn.region-bretagne.fr/img/vn/ecluse/ECL_IR33.jpg


**Iframe sample** - dataset & order are not used

dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | iframe_1 | 1 | 1 | Iframe 1 | http://kartenn.region-bretagne.fr/sviewer/?layers=rb:lycee



### PRINCIPE

Each report stored in mviewer/reports is a folder containing :

* Required `config.json` which is the configuration file
* Required `report.html` which is the html strutured document to render report
if dataviz options are both defined in report.html with data-attributes and in config.json, configuration.json will overwrite html configuration.
each dataviz option can be defined in config.json or in report.html with the same parameter. Eg:


`{
"charts": [
{
"id": "chart1",
"label": "soldes",
"opacity": 0.5,
"type": "bar",
"colors":[#00b894]
}
]
}`


`<div id="chart1" class="report-chart" data-type="bar" data-opacity="0.5" data-label="soldes" data-colors="#00b894" ></div>`


**config.json optional parameters**

`{
"title": {"id": "mytitle"},
"charts": [{"id": "chart1", "label": "mychart", "type": "bar"}],
"tables": [{"id": "table1", "label": "column1,column2"}],
"figures": [{"id": "fig1"}]
}`
