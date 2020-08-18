# Documentation du module textConfiguration.js

## Ajouter/Supprimmer/Modifier une des propriétés css a utliser dans le module

### Première étape

```javascript
// Ligne 11 dans textConfiguration.js
var _styleProperties = ["font-size", "font-weight", "color", "font-family", "letter-spacing", "text-transform"];
```
Il faut modifier ce tableau pour ajouter ou supprimer les propriétés css a utiliser

### Deuxième étape

```javascript
// Ligne 32 dans textConfiguration.js
 var _defaultStyleValues = {
        "color": "rgb(73, 80, 87)",
        "fontSize": "12px",
        "fontFamily": '\"Trebuchet MS\"',
        "fontWeight": "400",
        "letterSpacing": "0px",
        "text-transform":"none"
    }
```
Il faut ensuite définir la valeur par defaut des toutes les propriétés specifiées plus tôt

### Troisième étape

```html
<!-- Dans le fichier textConfiguration.html -->
<!-- Ex : Font Size-->
<div class="input-group input-group-sm mb-3">
    <div class="input-group-prepend">
        <span class="input-group-text">Taille de police</span>
    </div>
    <input type="number" class="figure chart table form-control textEditToBind" data-type="fontSize" data-unit="px" min="1" step="1" id="w_text_fontSize">
    <div class="input-group-append">
        <span class="input-group-text">px</span>
    </div>
</div>
```
Il faut ajouter dans le fichier html de la modal un input avec les éléments suivants : 
| Élément       | Description   |
| ------------- |:-------------:|
| input-group-prepend    | Titre du champ |
| input      | Le champ lui même      |
| input-group-append | unité du champ ex:px     |
