# mreport

mreport est un outil simple de **reporting web** qui permet de composer des rapports combinant **chiffres-clés**, **graphiques**, **images**, **textes** à partir de jeux de données intégrés dans la base de données de la solution. Un même rapport peut être valable pour un référentiel de localisation (Communes, EPCI,  gares...)

Les rapports générés restent "connectés"   aux données sources et sont affichables sur mobile, ordinateur et imprimables au format A4 pour un export pdf par exemple.

Outre l'aspect reporting, mreport dispose d'une **API** permettant de réutiliser les dataviz disponibles dans un rapport et de les intégrer dans un autre outil web ou un CMS.


## API

`/mreport/monrapport`  :  affiche la liste des localisants disponibles pour monrapport

`/mreport/monrapport/unlocalisant`  :  affiche le rapport  monrapport pour un localisant donné

`/mreport/monrapport/unlocalisant/madataviz`  :  affiche la dataviz  disponible dans monrapport pour un localisant donné



## Types de représentations (dataviz) disponibles


* ### Chiffres clés :
![Chiffres clés](img/figure.png "Chiffres clés")

* ### Graphiques :
![Graphique](img/chart.png "Graphique")

*  ### Tableaux :
![Tableau](img/table.png "Tableau")

*  ### Cartes :
![carte](img/map.PNG "Carte")

*  ### Textes :
![Texte](img/text.png "Texte")

*  ### Images :
![image](img/image.png "Image")

*  ### Contenus embarqués :
![Contenu embarqué (iframe)](img/iframe.png "Contenu embarqué")



### Structuration des données

A chaque localisant  (commune , gare...)  - **dataid**- est associé une ou plusieurs représentations - **dataviz** -
Chaque dataviz  contient une ou plusieurs séries de données - **dataset** - composées elles mêmes d'une ou plusieurs valeurs (**data** + **label**) ordonnées - **order**.

  Exemple

dataid | dataviz | dataset | order | label | data
-------|---------|---------|------|--------|-----
feature_1 | figure_1 | 1 | 1 | chiens | 28
feature_1 | figure_2 | 1 | 1 | chats | 72
feature_2 | figure_1 | 1 | 1 | chiens | 28
feature_2 | figure_2 | 1 | 1 | chats | 72

[En savoir plus](DATA.md)


### PRINCIPE

[Principes](PRINCIPES.md)
