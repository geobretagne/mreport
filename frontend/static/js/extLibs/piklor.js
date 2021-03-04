(function (root) {

    /**
     * Piklor
     * Creates a new `Piklor` instance.
     *
     * @name Piklor
     * @function
     * @param {String|Element} sel The element where the color picker will live.
     * @param {Array} colors An array of strings representing colors.
     * @param {Object} options An object containing the following fields:
     *
     *  - `open` (String|Element): The HTML element or query selector which will open the picker.
     *  - `openEvent` (String): The open event (default: `"click"`).
     *  - `style` (Object): Some style options:
     *    - `display` (String): The display value when the picker is opened (default: `"block"`).
     *  - `template` (String): The color item template. The `{color}` snippet will be replaced
     *    with the color value (default: `"<div data-col=\"{color}\" style=\"background-color: {color}\"></div>"`).
     *  - `autoclose` (Boolean): If `false`, the color picker will not be hided by default (default: `true`).
     *  - `closeOnBlur` (Boolean): If `true`, the color picker will be closed when clicked outside of it (default: `false`).
     *
     * @return {Piklor} The `Piklor` instance.
     */
    function Piklor(sel, colors, options) {
        var self = this;
        options = options || {};
        options.open = self.getElm(options.open);
        options.openEvent = options.openEvent || "click";
        options.manualSelect = options.manualSelect || false;
        options.removeColor = options.removeColor || false;
        options.style = Object(options.style);
        options.style.display = options.style.display || "block";
        options.closeOnBlur = options.closeOnBlur || false;
        options.pointer = options.pointer || false;
        options.template = options.template || "<div data-col=\"{color}\" style=\"background-color: {color}\"></div>";
        self.elm = self.getElm(sel);
        self.cbs = [];
        self.isOpen = true;
        self.colors = colors;
        self.options = options;
        self.render();
        self.manualColorPicker = self.options.manualSelect ? self.elm.querySelector(".manualColorPicking") : false;
        self.deleteColorBtn = self.options.removeColor ? self.elm.querySelector(".delete-color") : false;
        // Handle the open element and event.
        if (options.open) {
            options.open.addEventListener(options.openEvent, function (ev) {
                if (options.pointer) {
                    // Set tooltip Arrow on color panel opening
                    var pointer = document.getElementsByClassName("tooltip_pointer")[0];
                    self.isOpen ? (self.close(), pointer.style.display = "none") : (self.open(), pointer.style.display = "block");
                    var btn = this;
                    if (parseInt(btn.classList[1].split('btn').pop(), 10) <= 8 && ev.target.classList[0] != "textColorEditBtn") {
                        var rect_colors = document.getElementsByClassName("color-picker" + btn.classList[1].split('btn').pop())[0];
                        var colorsbounds = rect_colors.getBoundingClientRect();
                        var btnbounds = btn.getBoundingClientRect();
                        pointer.style.top = colorsbounds.top - 10 + "px";
                        pointer.style.left = btnbounds.left + ((btnbounds.right - btnbounds.left) / 2) + "px";
                    } else if (ev.target.classList[0] == "textColorEditBtn") {} else {
                        pointer.style.display = "none";
                    }
                }else{
                    self.isOpen ? self.close() : self.open();
                }

            });
        }

        // Click on colors
        self.elm.addEventListener("click", function (ev) {
            var col = ev.target.getAttribute("data-col");
            if (!col) {
                return;
            }
            self.set(col);
            self.close();
        });
        if (self.manualColorPicker) {
            // Validate custom color
            self.manualColorPicker.addEventListener("change", function (ev) {
                var col = ev.target.value;
                if (/^#([0-9A-F]{3}){1,2}$/i.test(col)) {
                    self.set(col);
                    self.close();
                } else {
                    ev.target.style.border = "1px solid red";
                }

            })
        }
        if(self.deleteColorBtn){
            // Delete selected Color
            self.deleteColorBtn.addEventListener("click", function () {
                self.elm.parentNode.removeChild(self.elm);
                self.options.open.parentNode.removeChild(self.options.open);
                wizard.onRemoveColor();
            })
        }
        if (options.closeOnBlur) {
            window.addEventListener("click", function (ev) {
                // check if we didn't click 'open' and 'color pallete' elements
                if (ev.target != options.open && ev.target != self.elm && self.isOpen && ev.target != self.manualColorPicker) {
                    self.close();
                    // Set tooltip Arrow on Blur
                    var pointer = document.getElementsByClassName("tooltip_pointer")[0];
                    var btn = ev.target;
                    if (btn.classList.contains("colorbtn") && parseInt(btn.classList[1].split('btn').pop(), 10) <= 8) {
                        var rect_colors = document.getElementsByClassName("color-picker" + btn.classList[1].substr(-1))[0];
                        var colorsbounds = rect_colors.getBoundingClientRect();
                        var btnbounds = btn.getBoundingClientRect();
                        pointer.style.top = colorsbounds.top - 10 + "px";
                        pointer.style.left = btnbounds.left + ((btnbounds.right - btnbounds.left) / 2) + "px";
                    } else {
                        pointer.style.display = "none";
                    }
                }
            });
        }

        if (options.autoclose !== false) {
            self.close();
        }
    }

    /**
     * getElm
     * Finds the HTML element.
     *
     * @name getElm
     * @function
     * @param {String|Element} el The HTML element or query selector.
     * @return {HTMLElement} The selected HTML element.
     */
    Piklor.prototype.getElm = function (el) {
        if (typeof el === "string") {
            return document.querySelector(el);
        }
        return el;
    };

    /**
     * render
     * Renders the colors.
     *
     * @name render
     * @function
     */
    Piklor.prototype.render = function () {
        var self = this,
            html = "";

        self.colors.forEach(function (c) {
            html += self.options.template.replace(/\{color\}/g, c);
        });
        var temp = "";
        if (this.options.manualSelect) {
            temp += "<div class='col-6 px-2 my-2 optional-parameter'><input class='manualColorPicking' placeholder='Saisissez une couleur'></input></div>";
        }
        if(this.options.removeColor){
            temp+='<div class="col-6 px-2 my-2 optional-parameter"><button type="button" class="btn mreport-primary-color-3-bg delete-color">Delete Color</button></div>';
        }
        html+='<div class="optional-piklor-parameters row">'+temp+'</div>';
        self.elm.innerHTML = html;
    };

    /**
     * close
     * Closes the color picker.
     *
     * @name close
     * @function
     */
    Piklor.prototype.close = function () {
        if (this.manualColorPicker) {
            this.manualColorPicker.style.border = "none";
        }
        this.elm.style.display = "none";
        this.isOpen = false;
    };

    /**
     * open
     * Opens the color picker.
     *
     * @name open
     * @function
     */
    Piklor.prototype.open = function () {
        if (this.manualColorPicker) {
            var _hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
            this.manualColorPicker.value = wizard.rgb2hex(this.options.open.style.backgroundColor, _hexDigits);
        }
        this.elm.style.display = this.options.style.display;
        this.isOpen = true;
    };

    /**
     * colorChosen
     * Adds a new callback in the colorChosen callback buffer.
     *
     * @name colorChosen
     * @function
     * @param {Function} cb The callback function called with the selected color.
     */
    Piklor.prototype.colorChosen = function (cb) {
        this.cbs.push(cb);
    };

    /**
     * set
     * Sets the color picker color.
     *
     * @name set
     * @function
     * @param {String} c The color to set.
     * @param {Boolean} p If `false`, the `colorChosen` callbacks will not be called.
     */
    Piklor.prototype.set = function (c, p) {
        var self = this;
        self.color = c;
        if (p === false) {
            return;
        }
        self.cbs.forEach(function (cb) {
            cb.call(self, c);
        });
    };

    root.Piklor = Piklor;
})(this);