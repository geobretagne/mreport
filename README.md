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

One CSV file per report

Each feature is represented by differents dataviz. Each dataviz contains one or many datasets and one or more data.

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


**Chart sample** one dataset is one dataset


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

![chart_1](img/chart_1.png?raw=true "chart_1")


**Table sample** one dataset is a column content


dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | table_1 | 1 | 1 | Mois | Janvier |
ECLUSE_1 | table_1 | 2 | 2 | Passage | 12 |
ECLUSE_1 | table_1 | 1 | 2 | Mois | Février |
ECLUSE_1 | table_1 | 2 | 2 | Passage | 22 |
ECLUSE_1 | table_1 | 1 | 3 | Mois | Mars |
ECLUSE_1 | table_1 | 2 | 2 | Passage | 222

![table_1](img/table_1.png?raw=true "table_1")


**Figure sample** - dataset & order are not used


dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | figure_1 | 1 | 1 | Nombre total de passage de bâteaux | 483



**Map sample** - one dataset is a location (Y,X,Z)

dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | map_1 | point_1 | 1 | Latitude ECLUSE N°1 | 48.2
ECLUSE_1 | map_1 | point_1 | 2 | Longitude ECLUSE N°1 | -1.5
ECLUSE_1 | map_1 | point_1 | 3 | Zoom ECLUSE N°1 | 14

![map_1](img/map_1.png?raw=true "map_1")


**Image sample** - dataset & order are not used


dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | image_1 | 1 | 1 | Image 1 | http://kartenn.region-bretagne.fr/img/vn/ecluse/ECL_IR33.jpg


**Iframe sample** - dataset & order are not used


dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
ECLUSE_1 | iframe_1 | 1 | 1 | Iframe 1 | http://kartenn.region-bretagne.fr/sviewer/?layers=rb:lycee


**Full sample**

[CSV file](reports/sample/data.csv)



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


config.json required parameters

`{
  "data_url": "data.php",
  "data_type": "dynamic",
  "dataid": "dataid",
  "data_other_parameters": [],
  "debug": true,
  "share": true

}`

config.json optionnal parameters

`{
  "title": {"id": "mytitle"},
  "charts": [{"id": "chart1", "label": "mychart", "type": "bar"}],
  "tables": [{"id": "table1", "label": "column1,column2"}],
  "figures": [{"id": "fig1"}],


}`


### HTML STRUCTURE & SYNTAX

Each dataviz is an html element with id equals to dataviz id with a specific css class.

css class | target element | description
----------|----------------|--------
report-chart | chart element | `data-type`, `data-label`, `data-colors`, `data-opacity`
report-figure | report element | add `data-unit` attribute to add suffix value at the report-figure-chiffre element
report-figure-chiffre | report element child (1) | todo
report-figure-caption | report element child (1) | todo
report-map | map element | todo
report-table | table element | `data-label` attribute to set columns labels
report-title | title element | todo
report-text | text element | todo
report-text-title |  text element child (1) | todo
report-text-title |  text element child (1) | todo
report-image |  image element | todo
report-iframe | iframe element | todo
report-group | dataviz block | todo
report-group-item | dataviz block chid (n) | todo


