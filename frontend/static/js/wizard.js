wizard = (function () {
    /*
     * Private
     */

    /*
     * Wizard needs data to vizualize dataviz configuration
     * each data sample linked to dataviz is stored for next usage
     * in _storeData and active dataviz data if is stored in _data
     */

    var _data = {};

    var _storeData = {};

    /*
     * _dataviz_infos from admin.getDataviz(datavizId);
     *
     * {
        "dataviz":"epci_surface_batie_lycee",
        "description":"",
        "job":"epci_edr",
        "level":"epci",
        "source":"région Bretagne",
        "title":"Surface bâtie lycée par EPCI",
        "type":"figure",
        "unit":"m²",
        "viz":"{
                    "type":"figure",
                    "data":{},
                    "properties":{
                        "id":"epci_surface_batie_lycee",
                        "model":"b",
                        "unit":"m²",
                        "icon":"icon-appartement"
                    }
            },
        "year":"2020"
        }
     */


    var _dataviz_infos = {};

    var _dataviz_definition = {};

    /*
     * ExistingConfig is a dataviz
     * conf herited of composition report
     * this var is used by wizard to initiate itself with existing conf
     */

    var _existingConfig = false;

    /* Method to extract a set of data in relation with dataviz
     * and necessary to configure and visualize a dataviz for a report
     * Result is stored in _data variable & in _storeData[xxx] to reuse it later
     */
    var _getSampleData = function (datavizId) {
        // function countUnique is used to test if labels linked to dataviz are unique or not.
        function countUnique(iterable) {
            return new Set(iterable).size;
        }
        //get sample data linked to dataviz, format it and store it for later
        $.ajax({
            dataType: "json",
            type: "GET",
            url: [report.getAppConfiguration().api, "store", datavizId, "data/sample"].join("/"),
            success: function (data) {
                if (data.data) {
                    //update local data
                    var tmp_data = {
                        "dataset": {}
                    };
                    var formatedData = {
                        "dataset": [],
                        "data": [],
                        "label": [],
                        "rows": 0,
                        "significative_label": false
                    };
                    //test multilines and format data and populate formatedData
                    if (data.data.length === 1) {
                        //eg figure : data = {"data":"1984","dataset":"bigbrother","label":"Roman de G. Orwell","order":1}
                        var a = data.data[0];
                        formatedData = {
                            "dataset": [a.dataset],
                            "data": [a.data],
                            "label": [a.label],
                            "rows": 1,
                            "significative_label": true
                        };
                    } else {
                        /* eg graph with 2 datasets: data = [
                            {"data":"10","dataset":"voitures","label":"2019","order":1},
                            {"data":"15","dataset":"voitures","label":"2020","order":2},
                            {"data":"12","dataset":"vélos","label":"2019","order":1},
                            {"data":"13","dataset":"vélos","label":"2020","order":2}
                        ]
                           or graph with one dataset  : data = [
                            {"data":"75%","dataset":"budget","label":"disponible","order":1},
                            {"data":"25%","dataset":"budget","label":"dépensé","order":2}
                           ]
                        */
                        data.data.forEach(function (item) {
                            if (tmp_data.dataset[item.dataset]) {
                                tmp_data.dataset[item.dataset].data.push(item.data);
                                tmp_data.dataset[item.dataset].label.push(item.label);
                            } else {
                                tmp_data.dataset[item.dataset] = {
                                    "data": [item.data],
                                    "label": [item.label]
                                };
                                formatedData.dataset.push(item.dataset);
                            }
                        });
                        /* if more than one dataset store data and labels in this model :
                         *   [
                                [dataset1.value1, dataset1.value2],
                                [dataset2.value1, dataset2.value2]
                            ]
                        */
                        if (formatedData.dataset.length > 1) {
                            formatedData.dataset.forEach(function (dataset) {
                                formatedData.data.push(tmp_data.dataset[dataset].data);
                                formatedData.label.push(tmp_data.dataset[dataset].label);
                            });
                            formatedData.rows = formatedData.data[0].length;
                            // Test if labels are significative. If then labels can be used as column in table dataviz
                            formatedData.significative_label = (countUnique(formatedData.label[0]) > 1);

                        } else {
                            /* Put directly data and labels from the unique dataset
                                [value1, value2]
                            */
                            formatedData.data = tmp_data.dataset[formatedData.dataset[0]].data;
                            formatedData.label = tmp_data.dataset[formatedData.dataset[0]].label;
                            formatedData.rows = formatedData.data.length;
                            // Test if labels are significative. If then labels can be used as column in table dataviz
                            formatedData.significative_label = (countUnique(formatedData.label[0]) > 1);
                        }
                    }

                    _data = formatedData;
                    _storeData[datavizId] = formatedData;
                    _configureWizardOptions();

                } else {
                    console.log("Erreur : Impossible de récupérer l'échantillon de données : " + data);
                }
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    };

    /*
     * _clean Method to clear wizard form
     */

    var _clean = function () {
        $("#dataviz-attributes").hide();
        //remove existing result
        $("#wizard-result div").remove();
        //remove all form values
        $(".dataviz-attributes").val("");
        $("#w_dataviz_type").val("");
        $("#wizard-code").text("");
        $(".colorbtn, .color-picker").each(function (index, elem) {
            elem.remove();
        })
        _resetTextField(document.getElementById("w_title"));
        _resetTextField(document.getElementById("w_desc"));

    };
    var _resetTextField = function (textField) {
        var style = textField.style;
        style.color = "rgb(73, 80, 87)";
        style.fontSize = "1em"
        style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
        style.fontWeight = "400"
    }
    /*
     * Method to configure wizard options with dataviz capabilities
     * Update options in select control #w_dataviz_type"
     */
    var _configureWizardOptions = function () {
        // TODO REFACTOR THIS
        var dataset_nb = _data.dataset.length;
        var data_nb = _data.rows;
        var data_type = "text";
        var significative_label = _data.significative_label;
        if (_data.dataset.length === 1) {
            var _url = new RegExp(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);
            if (_url.test(_data.data[0])) {
                data_type = "url";
            }
            if (_data.data[0] && _data.data[0].startsWith("POINT")) {
                data_type = "geom";
            }
        } else {
            if (_data.data[0] && _data.data[0][0] && _data.data[0][0].startsWith("POINT")) {
                data_type = "geom";
            }
        }

        var options = [];
        if (data_type === "geom") {
            options.push(["map", "fas fa-map-marker-alt"]);
        }
        // Many datasets => table, chart
        if (dataset_nb > 1) {
            options.push(["table", "fas fa-table"]);
            if (significative_label) {
                options.push(["chart", "fas fa-chart-bar"]);
            }
        } else {
            if (data_nb === 1) {
                // 1 dataset une seule ligne => figure, text, iframe, image
                if (data_type === "text") {
                    options.push(["figure", "fas fa-sort-numeric-down"]);
                    options.push(["text", "far fa-file-alt"]);
                } else if (data_type === "url") {
                    options.push(["iframe", "far fa-map"]);
                    options.push(["image", "far fa-image"]);
                }
            } else {
                // 1 dataset plusieurs lignes => table, chart
                options.push(["chart", "fas fa-chart-bar"]);
                // un seul dataset but significative label
                if (significative_label) {
                    options.push(["table", "fas fa-table"]);
                }
            }
        }
        var dataviz_options = ['<option class="dataviz-options" selected disabled>...</option>'];
        options.forEach(function (option) {
            dataviz_options.push('<option  data-icon="' + option[1] + '" class="dataviz-options" value="' + option[0] + '">' + option[0] + '</option>');
        });

        $("#w_dataviz_type .dataviz-options").remove();
        $("#w_dataviz_type").append(dataviz_options.join(""));

        $("#indicateur-metadata").html("<code>" + [dataset_nb + " datasets disponible(s)",
            data_nb + " lignes",
            "Labels utilisables " + significative_label
        ].join("<br>") + "</code>");

        $("#wizard-panel").attr("metadata-datasets", dataset_nb);
        $("#wizard-panel").attr("metadata-rows", data_nb);
        $("#wizard-panel").attr("metadata-significative-label", significative_label);


    };

    /*
     * Method to automaticaly set dataviz parameters in #wizard-parameters form
     * this method is called by  _onChangeDatavizType linked to w_dataviz_type change event
     */
    _autoConfig = function (dataviz) {
        let modelId = document.getElementById("selectedModelWizard").value;
        var colors = composer.models()[modelId].parameters.colors || ["#e55039", "#60a3bc", "#78e08f", "#fad390"];
        var unit = _dataviz_infos.unit;
        $("#w_unit").val(unit);
        //significative label if is true, allow chart and extra column in table
        var significative_label = _data.significative_label;
        var nb_datasets = _data.dataset.length;
        var columns = [];
        for (var i = 0; i < nb_datasets; i++) {
            columns.push(i + 1);
        }

        switch (dataviz) {
            case "chart":
                // chart parameters
                $("#w_chart_opacity").val("0.75");
                // set chart type
                var chart_type = _dataviz_infos.type || 'bar';
                $("#w_chart_type").val(chart_type);
                $("#w_colors").val(colors.slice(0, nb_datasets).join(","));
                let basecolors = document.getElementById("w_colors").value.split(',');
                basecolors.forEach(function (elem) {
                    _updateColorPicker({
                        "color": elem,
                        "datasets": nb_datasets
                    })
                });
                // set chart label(s)
                if (nb_datasets === 1) {
                    $("#w_label").val("Légende");
                } else {
                    $("#w_label").val(_data.dataset.join(","));
                }
                break;
            case "table":
                // set table headers
                $("#w_label").val(_data.dataset.join(","));
                //select columns (datasets) to render tin table
                $("#w_table_column").val(columns.join(","));
                if (significative_label) {
                    $("#w_table_extracolumn").val("#");
                    //show extra columns parameters
                    _enableExtraColumnParameter(true);
                } else {
                    //hide extra columns parameters
                    $("#w_table_extracolumn").closest(".input-group").hide();
                }
                break;

        }
    };

    //show or hide  extra columns parameters
    _enableExtraColumnParameter = function (enable) {
        if (enable) {
            $("#w_table_extracolumn").closest(".input-group").show();
        } else {
            $("#w_table_extracolumn").closest(".input-group").hide();
        }
    }

    /*
    * Apply dataviz conf from composition report.
    . By this way on open wizard, dataviz is directly rendered
    */

    _applyDatavizConfig = function (cfg) {
        /*
        {
            "type":"figure",
            "properties": {
                "unit": "m²",
                "colors": "orange,blue"
            }
        }

        */
        // get all dataviz parameters from dataviz configuration
        $("#w_dataviz_type").val(cfg.type);
        $("#w_label").val(cfg.properties.label);
        var title = $("#w_title");
        var description = $("#w_desc");
        if (cfg.properties.title) {
            let cfgTitle = JSON.parse(cfg.properties.title);
            title.val(cfgTitle.text);
            for (var styleproperty in cfgTitle.style) {
                title.css(styleproperty, cfgTitle.style[styleproperty]);
            }
        }
        if (cfg.properties.description) {
            let cfgDesc = JSON.parse(cfg.properties.description);
            description.val(cfgDesc.text);
            for (var styleproperty in cfgDesc.style) {
                description.css(styleproperty, cfgDesc.style[styleproperty]);
            }
        }
        // Set colors for Piklor lib
        $("#w_colors").val(cfg.properties.colors);
        let basecolors = document.getElementById("w_colors").value.split(',');
        basecolors.forEach(function (elem) {
            _updateColorPicker({
                "color": elem,
                "datasets": _data.dataset.length
            }, {
                "type": "click"
            })
        });
        if (cfg.properties.icon) {
            $("#w_icon").val(cfg.properties.icon);
        }
        if (cfg.properties.unit) {
            $("#w_unit").val(cfg.properties.unit);
        }

        //show fields linked to dataviz type (table, figure, chart...)
        _showParameters(cfg.type);
        if (cfg.type === "chart") {
            $("#w_chart_opacity").val(cfg.properties.opacity);
            $("#w_chart_type").val(cfg.properties.type);
        } else if (cfg.type === "table") {
            $("#w_table_column").val(cfg.properties.columns);
            if (cfg.properties.extracolumn) {
                //show and set extracolumn parameter
                _enableExtraColumnParameter(true);
                $("#w_table_extracolumn").val(cfg.properties.extracolumn);
            } else {
                //hide extracolumn parameter
                _enableExtraColumnParameter(false);
            }

        }
    }

    /*
     * _configureDataviz. This method get dataviz definition in wizard and put it in dataviz-definition
     * in the report composition
     */

    var _configureDataviz = function (datavizId) {
        //Get current dataviz id
        var datavizId = $("#wizard-panel").attr("data-related-id");
        //copy paste generated code in <code> element
        $('[data-dataviz="' + datavizId + '"] code.dataviz-definition').text($("#wizard-code").text());
        //get dataviz type
        var datavizType = $("#w_dataviz_type").val();
        var ico = $("#w_dataviz_type option:selected").attr("data-icon");
        //update dataviz element icon (chart for chart, table for table...)
        $('[data-dataviz="' + datavizId + '"] button i').get(0).className = ico;
        //Tag dataviz element as yet configured
        $('[data-dataviz="' + datavizId + '"] button').closest(".tool").addClass("configured");
        //Reset and hide wizard modal
        $("#wizard-result div").remove();
        $("#wizard-code").text("");
        $("#wizard-panel").modal("hide");
    };

    /*
     * _saveDataviz. This method get dataviz definition in wizard and save it in viz dataiz field
     *
     */

    var _saveDataviz = function () {
        //Get current dataviz id
        var datavizId = $("#wizard-panel").attr("data-related-id");
        //get dataviz definition
        var viz = JSON.stringify(_dataviz_definition);
        $.ajax({
            dataType: "json",
            type: "POST",
            contentType: 'application/json',
            url: [report.getAppConfiguration().api, "store", datavizId].join("/"),
            data: JSON.stringify({
                "viz": viz
            }),
            success: function (response) {
                if (response.response === "success") {
                    Swal.fire({
                        title: 'Sauvegardé',
                        text: "La dataviz \'" + datavizId + "\' a été sauvegardée comme représentation par défaut.",
                        icon: 'success',
                        showCancelButton: false
                    });
                } else {
                    alert("enregistrement échec :" + response.response);
                }
            },
            error: function (a, b, c) {
                console.log(a, b, c);
            }
        });


    };

    // this method shows fields linked to dataviz type (table, figure, chart...)
    var _showParameters = function (dataviz) {
        $("#dataviz-attributes").show();
        $(".dataviz-attributes").closest(".input-group").hide();
        $("." + dataviz + ".dataviz-attributes").closest(".input-group").show();
        if (dataviz === "chart") {
            $("#w_label").closest(".input-group").find(".input-group-text").text("séries");
        } else if (dataviz === "table") {
            $("#w_label").closest(".input-group").find(".input-group-text").text("labels");
        }
        if (!$("#w_icon").val()) {
            $("#w_icon").val("icon-default");
        }

    };

    /*
     * _onChangeDatavizType. This method is linked to #w_dataviz_type select control event change
     *
     */
    var _onChangeDatavizType = function () {
        // get dataviz representation type
        var dataviz = $("#w_dataviz_type").val();
        //Reset dataviz parameters form
        $(".dataviz-attributes").val("");
        //Show fields linked to dataviz type
        _showParameters(dataviz);
        // automaticaly set dataviz parameters in #wizard-parameters form
        _autoConfig(dataviz);
        _existingConfig = false;
        //Refresh dataviz renderer
        $("#wizard_refresh").click();
    };

    /*
     * _onWizardOpened. This method is linked to open wizard modal event.
     *
     */

    var _onWizardOpened = function (e) {

        //Detect wich component calls this
        if (e.relatedTarget.dataset.component === "store") {
            //deactivate button save in report
            document.getElementById("wizard_add").classList.add("hidden");
            //activate model selection
            document.getElementById("selectedModelWizard").disabled = false;
        } else {
            document.getElementById("wizard_add").classList.remove("hidden");
            document.getElementById("selectedModelWizard").disabled = true;
        }
        //Get datavizid linked to the wizard modal
        var datavizId = $(e.relatedTarget).attr('data-related-id');
        //Get dataviz infos (description , titile, unit, viz...) if exists
        _dataviz_infos = admin.getDataviz(datavizId);

        //Set datavizid in the modal
        $(e.currentTarget).attr("data-related-id", datavizId);
        $(e.currentTarget).find(".modal-title").text(datavizId);
        //clear wizard form;
        _clean();
        // Add text config buttons
        textedit.configureButtons(e.currentTarget);
        //Test if dataviz has a default visualization or is yet configured in active session
        //check if configuration exists for this dataviz with attributes. eg data-colors...
        var yetConfigured = $(e.relatedTarget).closest(".dataviz").find("code.dataviz-definition").text() || false;

        if (_dataviz_infos && _dataviz_infos.viz && !yetConfigured) {
            //Occurs when wizard is called from store
            var viz = JSON.parse(_dataviz_infos.viz);
            //Enable the model if defined
            let modelId = viz.properties.model || "b";
            let model ="";
            if (modelId) {
                document.getElementById("selectedModelWizard").value = modelId;
                model = composer.models()[modelId];
                wizard.updateIconList(model);
            } else {
                document.getElementById("selectedModelWizard").value = "";
            }
            _data = viz.data[viz.properties.id];
            _json2form(viz);
            _existingConfig = viz;
        } else if (yetConfigured) {
            //Occurs when wizard is called from report composer and dataviz is yet configured
            var _code = $($.parseHTML(yetConfigured)).find(".dataviz");
            _existingConfig = html2json(_code[0]);
        } else {
            //Occurs when wizard is called from report composer
            _existingConfig = false;
            //download data for this dataviz if necessary
            if (!_storeData[datavizId]) {
                _getSampleData(datavizId);
            }
        }

        if (_existingConfig) {

            //configure wizard options with dataviz capabilities
            _configureWizardOptions();

            //Apply config if exists
            _applyDatavizConfig(_existingConfig);
            //Render dataviz in result panel
            setTimeout(_onValidateConfig, 500);

        }


    };

    var _updateIconList = function (model) {
        //update icon store in wizard modal
        $("#w_icon option").remove();
        var icon_options = [];
        var icons = model.style.match(/icon-\w+/g);
        icons.forEach(function (i) {
            icon_options.push('<option value="' + i + '">' + i + '</option>');
        });
        $("#w_icon").append(icon_options.join(""));

    };

    var _onChangeModel = function (modelId) {
        let model = composer.models()[modelId];
        _updateIconList(model);
        _updateStyle(model);

    };

    var _updateStyle = function (model) {
        $("#wizard-result style").remove();
        $("#wizard-result").append(model.style);
    };

    var html2json = function (html) {
        //Get the config from html attributes
        var properties = {};
        properties = html.dataset;
        properties.id = html.id;
        var cfg = {
            "type": "",
            "properties": properties
        };
        // Get dataviz type (hugly !)
        // check class linked to dataviz - eg : from class report-chart" --> extract chart
        html.classList.forEach(function (cls) {
            var t = cls.split("report-");
            if (t.length === 2) {
                cfg.type = t[1];
            }
        })
        return cfg;
    };

    var _json2html = function (viz) {
        var modelId = viz.model || "b";
        var model = composer.models()[modelId];
        var style = model.style;
        //TODO Refactore this
        var component = $.parseHTML(model.dataviz_components[viz.type].replace("{{dataviz}}", viz.properties.id))[0];
        //set icon class from icon attribute for figures components
        if (viz.properties.icon && viz.type === "figure") {
            var figure = component.querySelector(".dataviz");
            //remove existing icon class eg icon-default
            figure.classList.forEach(className => {
                if (className.startsWith('icon-')) {
                    figure.classList.remove(className);
                }
            });
            //add icon class
            figure.classList.add(viz.properties.icon);
            figure.classList.add("custom-icon");
        }

        var container = document.createElement("div");
        container.innerHTML = style;
        container.id = "yviz";
        container.className = "col";
        container.style.border = "solid";
        let dataviz = component.querySelector(".dataviz");
        for (const [attribute, value] of Object.entries(viz.properties)) {
            if (attribute !== "id") {
                dataviz.dataset[attribute] = value;
            }
        }
        container.appendChild(component);
        return container;

    }

    /*
     * _json2form. This methodset values from config
     * and populate wizard form.
     *
     */

    var _json2form = function (viz) {
        //Update wizard form with default dataviz values
        $("#w_dataviz_type").val(viz.type);
        for (const [attribute, value] of Object.entries(viz.properties)) {
            if (attribute !== "id") {
                $("#w_" + attribute).val(value);
            }
        }
    }

    /*
     * _form2json. This method is get values from wizard parameters
     * and populate a json config object
     *
     */

    var _form2json = function () {
        var dataviz = $("#wizard-panel").attr("data-related-id");
        var type = $("#w_dataviz_type").val();
        var modelId = document.getElementById("selectedModelWizard").value;
        var attributes = [];
        var properties = {
            "id": dataviz,
            "model" : modelId
        };
        $(".dataviz-attributes").each(function (id, attribute) {
            var val = $(attribute).val();
            if (attribute.classList.contains("addedText") && val.length >= 1) {
                let style = window.getComputedStyle(attribute, null);
                val = '{\
                    "text": "' + val + '",\
                    "style": {\
                        "fontSize": "' + style.getPropertyValue("font-size") + '",\
                        "color": "' + style.getPropertyValue("color") + '",\
                        "fontFamily": "' + style.getPropertyValue("font-family").replace(/"/g, "'") + '",\
                        "fontWeight": "' + style.getPropertyValue("font-weight") + '"\
                    }\
                }'
            }
            var prop = $(attribute).attr("data-prop");
            if (val && val.length >= 1) {
                attributes.push("data-" + prop + '="' + val + '"');
                attributes.push({
                    "prop": prop,
                    "value": val
                });
                properties[prop] = val;
            }
        });
        ["colors", "label"].forEach(function (prop) {
            if (properties[prop]) {
                properties[prop] = properties[prop].split(",");
            }
        });

        ["columns"].forEach(function (prop) {
            if (properties[prop]) {
                properties[prop] = properties[prop].split(",").map(function (val) {
                    return Number(val) - 1;
                });
            }
        });

        var fdata = {};
        fdata[dataviz] = _data;
        //Store config dtatviz in json object
        _dataviz_definition = {
            "type": type,
            "data": fdata,
            "properties": properties
        };
        return _dataviz_definition;


    };

    /*
     * _onValidateConfig. This method pass a config object to the report.testViz method.
     * Used by #wizard_refresh button and the auto render method in _onWizardOpened
     *
     */

    var _onValidateConfig = function () {
        var viz = _form2json();
        var modelId = viz.properties.model;
        var model = composer.models()[modelId];
        if (viz.type && viz.data && viz.properties) {
            //Get dataviz component herited from template and set attributes with properties object
            var elem = $.parseHTML(model.dataviz_components[viz.type].replace("{{dataviz}}", viz.id || viz.properties.id));
            for (const [attribute, value] of Object.entries(viz.properties)) {
                if (attribute === "id") {
                    $(elem).find(".dataviz").attr("id", value);
                } else {
                    $(elem).find(".dataviz").attr("data-" + attribute, value);
                }

            }

            //set icon class from icon attribute for figures components
            var icon = $(elem).find(".dataviz").attr("data-icon");
            if (icon && viz.type === "figure") {
                var figure = $(elem).find(".dataviz")[0];
                //remove existing icon class eg icon-default
                figure.classList.forEach(className => {
                    if (className.startsWith('icon-')) {
                        figure.classList.remove(className);
                    }
                });
                //add icon class
                figure.classList.add(icon);
                figure.classList.add("custom-icon");
            }
            //Render result in wizard modal
            $("#wizard-result div").remove();
            $("#wizard-result").append(elem);
            $("#wizard-code").text(elem[0].outerHTML);
            //Draw dataviz with data, type and properties
            report.testViz(viz.data, viz.type, viz.properties);
        }
    };

    var _rgb2hex = function (rgb, hexDigits) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (rgb !== null)
            return "#" + _hex(rgb[1], hexDigits) + _hex(rgb[2], hexDigits) + _hex(rgb[3], hexDigits);
        else
            return "";
    }
    var _hex = function (x, hexDigits) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    }
    var _updateColorPicker = function (saved, e) {
        var colorbtn = $("#picker-wrapper .colorbtn").length + 1;
        var modelId = document.getElementById("selectedModelWizard").value;
        var model = composer.models()[modelId];
        if (typeof saved.datasets === "undefined") {
            saved.datasets = _data.dataset.length;
        }
        if (typeof e === "undefined") {
            e = {};
        }
        if (colorbtn <= saved.datasets || e.type == "click") {
            $("#picker-wrapper").append('<div class="colorbtn colorbtn' + colorbtn + '"></div>');
            $(".colorbtn" + colorbtn).css('background-color', saved.color ? saved.color : "#FFF");
            $(".chosecolors").append('<div class="available_colors color-picker' + colorbtn + '"></div>');
            var pk = new Piklor(".color-picker" + colorbtn, model.parameters.colors, {
                open: ".picker-wrapper .colorbtn" + colorbtn,
                closeOnBlur: true
            })

            pk.colorChosen(function (col) {
                $(".colorbtn" + colorbtn).css('background-color', col);
                var pointer = document.getElementsByClassName("tooltip_pointer")[0];
                pointer.style.display = "none";
                var hidden_input = document.getElementById("w_colors");
                hidden_input.value = "";
                var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
                $(".colorbtn").each(function (index, elem) {
                    if (elem.style.backgroundColor != "") {
                        hidden_input.value += _rgb2hex(elem.style.backgroundColor, hexDigits) + ",";
                    }
                });
                hidden_input.value = hidden_input.value.slice(0, -1);

                //Delete color TODO
                // if(col=="#FFF"){
                // $(".colorbtn"+colorbtn+", .color-picker"+colorbtn).each(function(index,elem){
                //     elem.remove();
                // })
                // }


            });
        }

    };

    var _init = function () {
        //load wizard html dynamicly and append it admin.html
        $.ajax({
            url: "/static/html/wizard.html",
            dataType: "text",
            success: function (html) {
                $("body").append(html);
                //Events management
                $('#wizard-panel').on('show.bs.modal', _onWizardOpened);
                $("#w_dataviz_type").change(_onChangeDatavizType);
                $("#wizard_refresh").click(_onValidateConfig);
                $("#addColor").on("click", function (e) {
                    _updateColorPicker({}, e)
                });
            }
        });

    };




    /*
     * Public
     */

    return {

        init: _init,
        configureDataviz: _configureDataviz,
        saveDataviz: _saveDataviz,
        json2html: _json2html,
        rgb2hex: _rgb2hex,
        updateIconList: _updateIconList,
        getSampleData: _getSampleData,
        onChangeModel: _onChangeModel,
        updateStyle: _updateStyle
    }; // fin return

})();
