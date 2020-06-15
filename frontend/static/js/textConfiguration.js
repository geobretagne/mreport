textedit = (function () {
    /*
     * Private
     */


    var _currentInput = {};

    var _configureButtons = function(){

        // All the inputs that needs to be configured
        var inputs = document.getElementsByClassName("text-config");

        // Creating the button
        // Div container of the button
        var div = document.createElement("div");
        div.classList.add("input-group-append","buttonToRemove");

        // Button Itself
        var configButton = document.createElement("button");
        configButton.classList.add("btn", "btn-warning", "notdvz");
        configButton.dataset.toggle="modal";
        configButton.dataset.target="#textEdit"; 

        // Icon of the button 
        var buttonIcon = document.createElement("i");
        buttonIcon.classList.add("fas","fa-cog");

        // Assembling the button
        configButton.appendChild(buttonIcon);
        div.appendChild(configButton);

        // Configure onclick event on the new button
        div.addEventListener("click",function(){

        });
        // Remove all previous buttons in the modal
        var previousButtons = document.querySelectorAll(".buttonToRemove");
        for(button of previousButtons){
            button.remove();
        }
        // Adding the button to all needed inputs
        for(input of inputs){
            input.appendChild(div.cloneNode(true));
        }
        
                                                
    }
    var _onTextEditOpened = function (event) {
        var button = event.relatedTarget;
        var editedInput = button.parentNode.previousElementSibling;
        _currentInput = editedInput;
        var config = button.dataset;
        document.getElementById("w_text_text").value = editedInput.value;
        var pk = new Piklor(".text-color-picker", [
                "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50", "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6", "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
            ], {
                open: ".textcolor-config-wrapper .btn"
            }),
            input = pk.getElm(".textcolor-config-wrapper .input");
        pk.colorChosen(function (col) {
            document.getElementById("w_text_text").style.color=col;
            input.value = col;
        });

    }
    var _saveConfig = function(){

        // Get modified text input
        var modaltext = document.getElementById("w_text_text")

        // Get Style of modified input
        var style = modaltext.style;

        // Set new text
        _currentInput.value = modaltext.value;
     
        // Set color to update preview
        _currentInput.style.color = style.color;
        _currentInput.style.fontSize = style.fontSize;
        _currentInput.style.fontFamily = style.fontFamily;
      
        // Set data attribute to restore config
        _currentInput.dataset.textColor = style.color;
        _currentInput.dataset.textSize = style.fontSize;
        _currentInput.dataset.textFont = style.fontFamily;

        // Close modal
        $("#textEdit").modal("hide");

        // Clear Modal
        _clearModal();

        
    }
    var _updateFontFamily = function(event){
        var texte = document.getElementById("w_text_text");
        texte.style.fontFamily = event.target.value;
    }
    var _updateFontsize = function(event){
        var texte = document.getElementById("w_text_text");
        texte.style.fontSize = event.target.value + "em";
    }
    var _restoreconfig = function(){

    }
    var _clearModal = function(){
       var modal = document.getElementById("textEdit");
       var inputs = modal.getElementsByTagName("input");
       for(input of inputs){
           input.value="";
       }
    }
    var _init = function(){
        $("#textEdit").on('show.bs.modal',_onTextEditOpened);
        document.getElementById("saveTextConfig").addEventListener("click",_saveConfig);
        document.getElementById("w_text_fontsize").addEventListener("change",_updateFontsize);
        document.getElementById("w_text_font").addEventListener("change",_updateFontFamily);
    }

    /*
     * Public
     */

    return {
        configureButtons: _configureButtons,
        init:_init
        
    }; // fin return

})();