# Documentation du module textConfiguration.js

## Ajouter/Supprimmer/Modifier une des propriétés css a utiliser dans le module

### Première étape

```javascript
// Ligne 11 dans textConfiguration.js
var _styleProperties = ["font-size", "font-weight", "color", "font-family", "letter-spacing", "text-transform"];
```
Il faut modifier ce tableau pour ajouter ou supprimer les propriétés css à utiliser

### Deuxième étape

```javascript
// Ligne 32 dans textConfiguration.js
 var _defaultStyleValues = {
        "color": "rgb(73, 80, 87)",
        "fontSize": "12px",
        "fontFamily": '\"Trebuchet MS\"',
        "fontWeight": "400",
        "letterSpacing": "0px",
        "textTransform":"none"
    }
```
Il faut ensuite définir la valeur par défaut de toutes les propriétés spécifiées plus tôt

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
| input-group-append | unité du champ ex : px     |

Les classes de tous ces éléments sont toujours les même, il ne faut pas les modifier.

#### Atributs de l'input

| Attribut       | Description   |
| ------------- |:-------------:|
| data-type    | nom de la propriété css en camelCase |
| data-unit     | unité de la propriété css ex : px      |
| id | ex : w_text_ + nom de la propriété en camelCase     |

### Cas Particuliers
```javascript
// Ligne 115 textConfigration.js
// Handle particular cases
if (item === "color")
    newValue = wizard.rgb2hex(editedStyle[item], _hexDigits);
if (input.type === "number")
    newValue = _removeLetters(newValue);
input.value = newValue;
```
Ce bout de code remplit les champs avec la valeur configurer, or si le champ est de type `number` on ne peut pas le remplir avec `"25 px"` c'est donc pour traiter ce problème.

```javascript
// Ligne 183 textConfiguration.js
// Handle Particular cases
        var extraProperty = {
            "fontFamily":baseProperty.fontFamily==='-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'? _defaultStyleValues.fontFamily : baseProperty["fontFamily"]
        }
```
Cette fois-ci il faut modifier la variable extraProperty pour s'assurer que le style récupérer est bien le bon, ici la police ne voulant pas se mettre à jour j'ai été obligé de modifier cela.

### Modifier les polices
```javascript
// Ligne 13 textConfiguration.js
var _generatedFonts = {
    "generated": false,
    "fonts": [
        '\"04b30\"', 
        'Arial', 
        'Roboto', 
        '\"Times New Roman\"', 
        'Times', 
        'Verdana', 
        '\"Comic Sans MS\"', 
        '\"Segoe UI\"',
        '\"Trebuchet MS\"'
    ]
};
```
Pour ajouter des fonts a utliser il faut les spécifier dans cette liste. `Note`  : il faut faire attention certaines polices on besoin d'être entourées par des `"` il faut donc echapper ce caractère

#### Ajouter une police externe

Aller dans `static/fonts`

Ajouter le dossier contenant la police avec le fichier css spécifiant le `font-face`de la police puis ajouter le `font-family` contenu dans ce font-face dans la liste vue précédemment et pour finir il faut ajouter
un lien vers la police dans `static/templates/admin.html`

```html 
<link rel="stylesheet" href="/static/fonts/nomDeLaPolice/stylesheet.css">
```  
