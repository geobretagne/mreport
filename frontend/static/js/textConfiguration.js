textedit = (function () {
    /*
     * Private
     */


    var _currentInput = {};

    var _hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

    var _styleProperties = ["font-size", "font-weight", "color", "font-family", "letter-spacing", "text-transform"];

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

    var _textPatterns = {
        "title": '<div class="report-chart-title" data-model-icon="fas fa-text-width" data-model-title="Titre"><p class="editable-text"></p></div>',
        "summary": '<div class="report-chart-summary mt-auto" data-model-icon="fas fa-align-justify" data-model-title="Description"><p class="editable-text"></p></div>'
    }
    var _defaultStyleValues = {
        "color": "rgb(73, 80, 87)",
        "fontSize": "12px",
        "fontFamily": '\"Trebuchet MS\"',
        "fontWeight": "400",
        "letterSpacing": "0px",
        "text-transform":"none"
    }
    var _configureButtons = function (target = null) {
        if (target === null) {
            target = document;
        }
        // All the inputs that needs to be configured
        var inputs = target.getElementsByClassName("text-config");

        // Creating the button
        // Div container of the button
        var div = document.createElement("div");
        div.classList.add("input-group-append", "buttonToRemove");

        // Button Itself
        var configButton = document.createElement("a");
        configButton.classList.add("btn", "mreport-primary-color-2-bg", "notdvz");
        configButton.dataset.toggle = "modal";
        configButton.dataset.target = "#textEdit";

        // Icon of the button 
        var buttonIcon = document.createElement("i");
        buttonIcon.classList.add("fas", "fa-cog");

        // Assembling the button
        configButton.appendChild(buttonIcon);
        div.appendChild(configButton);

        // Configure onclick event on the new button
        div.addEventListener("click", function () {

        });
        // Remove all previous buttons in the modal
        var previousButtons = target.querySelectorAll(".buttonToRemove");
        for (button of previousButtons) {
            button.remove();
        }
        // Adding the button to all needed inputs
        for (input of inputs) {
            input.appendChild(div.cloneNode(true));
        }

    }
    var _onTextEditOpened = function (event) {

        // Get the button that triggered the modal
        var button = event.relatedTarget;

        // Get the input associated with the modal
        var editedInput = button.parentNode.previousElementSibling;

        // Save this input into a global variable reusable later
        _currentInput = editedInput;

        // Set the text of the modal to be the text of the editedInput
        var modalText = document.getElementById("w_text_text");
        modalText.value = editedInput.value;

        // Set fonts values for the select input
        if (!_generatedFonts.generated) {
            _generatedFonts.generated = true;
            var fontSelect = document.getElementById("w_text_fontFamily");
            for (font of _generatedFonts.fonts) {
                let option = document.createElement("option");
                option.text = font.replace(/\"/g,"");
                option.value = font;
                fontSelect.add(option);
            }
        }

        // Set the editedInput style to the modal fields
        var editedStyle = _getTextStyle(editedInput);

        _styleProperties.forEach(function (item) {
            var cameled = _camelize(item);
            var newValue = editedStyle[cameled];
            var input = document.getElementById("w_text_" + cameled);
            // Handle particular cases
            if (item === "color")
                newValue = wizard.rgb2hex(editedStyle[item], _hexDigits);
            if (input.type === "number")
                newValue = _removeLetters(newValue);
            input.value = newValue;
        })
        // Set the style of the modal text
        _applyTextStyle(modalText, editedStyle);

        // Create color picker for the Modal
        var pk = new Piklor(".text-color-picker", composer.activeModel().parameters.colors, {
                open: ".textcolor-config-wrapper .btn"
            }),
            input = pk.getElm(".textcolor-config-wrapper .input");
        pk.colorChosen(function (col) {
            document.getElementById("w_text_text").style.color = col;
            input.value = col;
        });
    }
    var _removeLetters = function (elem) {
        elem = elem.replace(/[^\d.,-]/g, '');
        if (elem.length === 0)
            elem = 0
        return elem;
    }
    var _saveConfig = function () {

        // Get modified text input
        var modaltext = document.getElementById("w_text_text")

        // Get Style of modified input
        var style = modaltext.style;

        // Set new text
        _currentInput.value = modaltext.value;

        // Set color to update preview
        _applyTextStyle(_currentInput, style);

        // Close modal
        $("#textEdit").modal("hide");

        // Clear Modal
        _clearModal();


    }
    var _updateInput = function (event, elem) {
        var texte = document.getElementById("w_text_text");
        var newValue = event.target.value;
        newValue += elem.dataset.unit;
        texte.style[elem.dataset.type] = newValue;
    }
    var _clearModal = function () {
        var modal = document.getElementById("textEdit");
        var inputs = modal.getElementsByTagName("input");
        for (input of inputs) {
            input.value = "";
        }
    }
    var _getTextStyle = function (elem) {
        var style = window.getComputedStyle(elem, null);
        var baseProperty = {};
        _styleProperties.forEach(function (item) {
            let property = _camelize(item);
            baseProperty[property] = style.getPropertyValue(item)
        })
        // Handle Particular cases
        var extraProperty = {
            "fontFamily":baseProperty.fontFamily==='-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'? _defaultStyleValues.fontFamily : baseProperty["fontFamily"]
        }
        Object.assign(baseProperty, extraProperty)
        return baseProperty
    }
    var _applyTextStyle = function (elem, style) {
        _styleProperties.forEach(function (item) {
            let property = _camelize(item);
            elem.style[property] = style[property]
        })
        return elem;
    }
    var _generateStyle = function (element) {
        var styleText = '';
        _styleProperties.forEach(function (elem) {
            let propertyValue = "";
            if (value = element.style[_camelize(elem)])
                propertyValue = value
            styleText += elem + ":" + propertyValue + ";";
        })
        return styleText;
    }
    var _camelize = function camelize(str) {
        return str.replace(/\W+(.)/g, function (match, chr) {
            return chr.toUpperCase();
        });
    }
    var _init = function () {
        $.ajax({
            url: "/static/html/textConfiguration.html",
            dataType: "text",
            success: function (html) {
                $("body").append(html);
                //Events management
                $("#textEdit").on('show.bs.modal', _onTextEditOpened);
                document.getElementById("saveTextConfig").addEventListener("click", _saveConfig);

                // Bind Inputs to update the text when changed
                var inputToBind = document.getElementsByClassName("textEditToBind");
                for (let i = 0; i < inputToBind.length; i++) {
                    inputToBind[i].addEventListener("change", function (event) {
                        _updateInput(event, this)
                    })
                }
            }
        });
    }

    /*
     * Public
     */

    return {
        configureButtons: _configureButtons,
        init: _init,
        getTextStyle: _getTextStyle,
        applyTextStyle: _applyTextStyle,
        generateStyle: _generateStyle,
        textPatterns: _textPatterns,
        defaultStyleValues: _defaultStyleValues
    }; // fin return

})();