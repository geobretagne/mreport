textedit = (function () {
    /*
     * Private
     */


    var _currentInput = {};

    var _hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

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
        configButton.classList.add("btn", "btn-warning", "notdvz");
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

        // Get all the data attribute of the button
        var config = button.dataset;

        // Set the text of the modal to be the text of the editedInput
        var modalText = document.getElementById("w_text_text");
        modalText.value = editedInput.value;

        // Set the editedInput style to the modal fields
        var editedStyle = _getTextStyle(editedInput);
        document.getElementById("w_text_fontsize").value = editedStyle.fontSize.slice(0, -2);
        document.getElementById("w_text_color").value = wizard.rgb2hex(editedStyle.color, _hexDigits);
        document.getElementById("w_text_fontweight").value= editedStyle.fontWeight;
        // Set the style of the modal text
        _applyTextStyle(modalText,editedStyle);

        // Create color picker for the Modal
        var pk = new Piklor(".text-color-picker", [
                "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
            ], {
                open: ".textcolor-config-wrapper .btn"
            }),
            input = pk.getElm(".textcolor-config-wrapper .input");
        pk.colorChosen(function (col) {
            document.getElementById("w_text_text").style.color = col;
            input.value = col;
        });



    }
    var _saveConfig = function () {

        // Get modified text input
        var modaltext = document.getElementById("w_text_text")

        // Get Style of modified input
        var style = modaltext.style;

        // Set new text
        _currentInput.value = modaltext.value;

        // Set color to update preview
        _applyTextStyle(_currentInput,style);

        // Set data attribute to restore config
        _currentInput.dataset.textColor = style.color;
        _currentInput.dataset.textSize = style.fontSize;
        _currentInput.dataset.textFont = style.fontFamily;
        _currentInput.dataset.textWeight = style.fontWeight;

        // Close modal
        $("#textEdit").modal("hide");

        // Clear Modal
        _clearModal();


    }
    var _updateFontFamily = function (event) {
        var texte = document.getElementById("w_text_text");
        texte.style.fontFamily = event.target.value;
    }
    var _updateFontSize = function (event) {
        var texte = document.getElementById("w_text_text");
        texte.style.fontSize = event.target.value + "em";
    }
    var _updateFontWeight = function (event) {
        var texte = document.getElementById("w_text_text");
        texte.style.fontWeight = event.target.value;
    }
    var _clearModal = function () {
        var modal = document.getElementById("textEdit");
        var inputs = modal.getElementsByTagName("input");
        for (input of inputs) {
            input.value = "";
        }
    }
    var _getTextStyle = function (elem) {
        let style = window.getComputedStyle(elem,null);
        let fontSize = (parseInt(style.getPropertyValue("font-size").substr(0, 2)) / 16) + "em";
        if(elem.style.fontSize){
            fontSize=elem.style.fontSize;
        }
        return {
            "color": style.getPropertyValue("color"),
            "fontSize": fontSize,
            "fontFamily": style.getPropertyValue("font-family"),
            "fontWeight": style.getPropertyValue("font-weight")
        }
    }
    var _applyTextStyle = function(elem,style){
        elem.style.fontSize = style.fontSize;
        elem.style.color = style.color;
        elem.style.fontFamily = style.fontFamily;
        elem.style.fontWeight = style.fontWeight;
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
                document.getElementById("w_text_fontsize").addEventListener("change", _updateFontSize);
                document.getElementById("w_text_font").addEventListener("change", _updateFontFamily);
                document.getElementById("w_text_fontweight").addEventListener("change",_updateFontWeight);

            }
        });
    }

    /*
     * Public
     */

    return {
        configureButtons: _configureButtons,
        init: _init,
        getTextStyle:_getTextStyle,
        applyTextStyle:_applyTextStyle

    }; // fin return

})();