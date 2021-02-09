# Interface admin

*Pour expliquer au mieux les différentes pages de l'admin nous utilisons les données demo qui sont présent demo.sql*

L'interface admin se décompose en 3 pages:

* Le catalogue 
* Les rapports
* Le composeur


## Catalogue

![Catalogue](img/catalogue.png "Catalogue")

Le catalogue affiche chaque jeux de donnée qui se trouve dans la table dataviz de la base de données.

Ici vous pouvez sélectionner les jeux de données à utiliser dans un rapport.

![Selection](img/selection.png "Séléction")

A partir de cette séléction il a possible de créer un nouveau rapport ou d'ajouter ces données à un rapport existant.

![Creation rapport](img/ajouter_rapport.png =100x "Création d'un rapport")

ou

![Ajouter à un rapport](img/creation_rapport.png =1"Ajouter à un rapport")

Comme autre fonctionnalité ici vous pouvez chercher un jeux de données ou de réintisaliser la séléction.


## Rapports

![Rapports](img/rapport.png "Rapports")

Sur la page rapport nous pouvons voir les rapports qui se trouvent dans la table report de la base de données. 

Pour un rapport c'est possible de modifier les jeux de données qui le composent

![Sourcer apport](img/sourcer_rapport.png "Sourcer les données")

A ce même endroit il y a les options de supprimer, afficher ou composer le rapport ainsi que le copier.


## Composeur

![Composeur](img/composeur.png "Composeur")

Dans le composeur il y a deux blocs, les options à gauche et la structuration du rapport sur le reste de la page. 

En ce qui concernce les options il faut dans un premier temps choisir quel rapport utiliser:

![Séléction d'un rapport](img/selection_rapport.png "Séléction d'un rapport")

Ensuite choisir un modèle de mise en page.

![Modèle du rapport](img/modele_rapport.png "Séléction d'un modeèle de mise en page")

Avec un glisser déposer des élements à gauche, il faut ajouter les blocs qui vont structurer le rapport dans la section princpale.

![Structure du rapport options](img/structure1_rapport.png "Structure du rapport options")

![Structure du rapport page](img/structure2_rapport.png "Structure du rapport page")

Une fois la structure ajouté, avec la même action du glisser déposer, ajouter les jeux de données au structure.

![Ajout données structure](img/donnees_rapport.png "Ajout des données à la structure")

Une fois le jeux de données en place il est alors possible de configurer leur affichage en cliquant sur l'engrenage.

Dans la fenêtre qui s'affiche plusieurs options de configuration sont présent. 

![configuration dataviz](img/config_dataviz.png "Ajout des données à la structure")

Le type défini dans dataviz pour cette exemple est figure, il y a donc des paramètres prédéfinis pour ce type.

Une fois votre rapport structuré avec les données et les dataviz, vous pouvez l'enregistrer et l'afficher votre rapport ou continuer de le modifier.
