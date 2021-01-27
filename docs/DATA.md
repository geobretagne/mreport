# Structuration des données.

La base de données de l'application est constituée de 5 tables.

Les 2 tables **dataviz** et **rawdata** contiennent les données et leurs métadonnées servant à réaliser les dataviz
La table **dataid** liste tous les localisants disponibles (Communes, EPCI, gares)
Les tables **report** et **report_composition** sont des tables de configuration propres à l'application (Nom des rapports et source des données)

![MCD](img/mcd.png "MCD")


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