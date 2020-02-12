wizard = (function() {
    /*
     * Private
     */
    var _data;

    var _storeData = {};

    _api_url = "http://localhost/api";

    /*
    * ExistingConfig is a dataviz
    * conf herited of composition report
    * this var is used by wizard to initiate itself with existing conf
    */

    var _exitingConfig = false;

    /* Method to extract a set of data in relation with dataviz
    * and necessary to configure and visualize a dataviz for a report
    * Result is stored in _data variable & in _storeData[xxx] to reuse it later
    */
    var _getSampleData = function(datavizId) {
        function countUnique(iterable) {
          return new Set(iterable).size;
        }
        $.ajax({
            dataType: "json",
            type: "GET",
            url: [_api_url, "store", datavizId, "data/sample"].join("/"),
            success: function (data) {
                if (data.data) {
                    //update local data
                    var tmp_data = {"dataset":{}};
                    var formatedData = {"dataset": [], "data": [], "label":[], "rows":0, "significative_label": false};
                    //test multilines
                    if (data.data.length === 1) {
                        var a = data.data[0];
                        formatedData = {"dataset": [a.dataset], "data": [a.data], "label":[a.label], "rows":1, "significative_label": true};
                    } else {
                        data.data.forEach(function(item) {
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
                        if (formatedData.dataset.length > 1) {
                            formatedData.dataset.forEach(function(dataset) {
                                formatedData.data.push(tmp_data.dataset[dataset].data);
                                formatedData.label.push(tmp_data.dataset[dataset].label);
                            });
                            formatedData.rows = formatedData.data[0].length;
                            formatedData.significative_label = (countUnique(formatedData.label[0]) > 1);

                        } else {
                            formatedData.data = tmp_data.dataset[formatedData.dataset[0]].data;
                            formatedData.label = tmp_data.dataset[formatedData.dataset[0]].label;
                            formatedData.rows = formatedData.data.length;
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

    var _clean = function () {
        //$(".wizard-code").hide();
        $("#dataviz-attributes").hide();
        $(".dataviz-attributes").val("");
        $("#wizard-result div").remove();
        $("#w_dataviz_type").val("");
        $("#wizard-code").text("");
    };

    /*
    * Method to configure wizard options with dataviz capabilities
    * Update options in select control #w_dataviz_type"
    */
    var _configureWizardOptions = function() {
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
        if (dataset_nb > 1) {
            options.push(["table", "fas fa-table"]);
            if (significative_label) {
                options.push(["chart","fas fa-chart-bar"]);
            }
        } else {
            if (data_nb === 1) {
                // 1 dataset une seule ligne
                if (data_type === "text") {
                    options.push(["figure", "fas fa-sort-numeric-down"]);
                    options.push(["text", "far fa-file-alt"]);
                } else if (data_type === "url") {
                    options.push(["iframe", "far fa-map"]);
                    options.push(["image", "far fa-image"]);
                }
            } else {
                // 1 dataset plusieurs lignes
                options.push(["chart","fas fa-chart-bar"]);
            }
        }
        var dataviz_options = ['<option class="dataviz-options" selected disabled>...</option>'];
        options.forEach(function(option) {
            dataviz_options.push('<option  data-icon="'+option[1]+'" class="dataviz-options" value="' + option[0] + '">' + option[0] + '</option>');
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
    * Method to automaticaly set dataviz parameters
    */
    _autoConfig = function(dataviz) {
        // TODO : colors should be inherited from model
        var colors = composer.colors() || ["#e55039", "#60a3bc", "#78e08f", "#fad390"];
        //significative label if is true, allow chart and extra column in table
        var significative_label = _data.significative_label;
        var nb_datasets = _data.dataset.length;
        var columns = [];
        for (var i = 0; i < nb_datasets; i++) {
            columns.push(i + 1);
        }

        switch (dataviz) {
            case "chart":
                $("#w_chart_opacity").val("0.75");
                $("#w_chart_type").val("bar");
                $("#w_colors").val(colors.slice(0, nb_datasets).join(","));
                if (nb_datasets === 1) {
                    $("#w_label").val("Légende");
                } else {
                    $("#w_label").val(_data.dataset.join(","));
                }
                break;
            case "table":
                $("#w_label").val(_data.dataset.join(","));
                $("#w_table_column").val(columns.join(","));
                if (significative_label) {
                    $("#w_table_extracolumn").val("#");
                    _enableExtraColumnParameter(true);
                } else {
                    $("#w_table_extracolumn").closest(".input-group").hide();
                }
                break;

        }
    };

    _loadConfig = function (html_config) {
        console.log(html_config);
    }

    _enableExtraColumnParameter = function (enable) {
        if (enable) {
            $("#w_table_extracolumn").closest(".input-group").show();
        } else {
            $("#w_table_extracolumn").closest(".input-group").hide();
        }
    }

    /*
    * Apply dataviz conf from composition report
    */

    _applyDatavizConfig = function (cfg) {
        $("#w_dataviz_type").val(cfg.dataviz_type);
        $("#w_colors").val(cfg.colors);
        $("#w_label").val(cfg.label);
        if (cfg.icon) {
            $("#w_icon").val(cfg.icon);
        }
        _showParameters(cfg.dataviz_type);
        if (cfg.dataviz_type === "chart") {
            $("#w_chart_opacity").val(cfg.opacity);
            $("#w_chart_type").val(cfg.type);
        } else if (cfg.dataviz_type === "table") {
            $("#w_table_column").val(cfg.columns);
            if (cfg.extracolumn) {
                 _enableExtraColumnParameter(true);
                 $("#w_table_extracolumn").val(cfg.extracolumn);
            } else {
                _enableExtraColumnParameter(false);
            }

        }
    }

    /*dataviz-options
    * Store dataviz configuration mreport like in virtual html report
    */

    var _configureDataviz = function (datavizId) {
        //Get current dataviz id
        var datavizId = $("#wizard-panel").attr("data-related-id");
        //copy paste generated code in <code> element
        $('[data-dataviz="'+ datavizId +'"] code.dataviz-definition').text($("#wizard-code").text());
        //get dataviz type
        var datavizType = $("#w_dataviz_type").val();
        var ico = $("#w_dataviz_type option:selected").attr("data-icon");
        $('[data-dataviz="'+ datavizId +'"] button i').get( 0 ).className = ico;
        $('[data-dataviz="'+ datavizId +'"] button').closest(".tool").addClass("configured");
        //Hide modal
        $("#wizard-result div").remove();
        $("#wizard-code").text("");
        $("#wizard-panel").modal("hide");
    };


    var _showParameters = function (dataviz) {
        $("#dataviz-attributes").show();
        $(".dataviz-attributes").closest(".input-group").hide();
        $("." + dataviz + ".dataviz-attributes").closest(".input-group").show();
        if (dataviz === "chart") {
            $("#w_label").closest(".input-group").find(".input-group-text").text("séries");
        } else if (dataviz === "table") {
            $("#w_label").closest(".input-group").find(".input-group-text").text("labels");
        }
        $("#w_icon").val("icon-default");

    };

    var _onChangeDatavizType = function() {
        var dataviz = $("#w_dataviz_type").val();
        $(".dataviz-attributes").val("");
        _showParameters(dataviz);
        _autoConfig(dataviz);
        _exitingConfig = false;
        $("#wizard_validate").click();
    };

    var _onWizardOpened = function (e) {
        var datavizId = $(e.relatedTarget).attr('data-related-id');
        $(e.currentTarget).attr("data-related-id", datavizId);
        $(e.currentTarget).find(".modal-title").text(datavizId);
        _clean();
        if (_storeData[datavizId]) {
            _data = _storeData[datavizId];
            //check if configuration exists
            var yetConfigured = $(e.relatedTarget).closest(".dataviz").find("code").text() || false;
            if (yetConfigured){
                var _code = $($.parseHTML($(e.relatedTarget).closest(".dataviz").find("code").text())).find(".dataviz");
                _exitingConfig = $(_code).data();
                // Get dataviz type (hugly !)
                $(_code).attr("class").split(" ").forEach(function (cls) {
                    var t = cls.split("report-");
                    if (t.length === 2) {
                        _exitingConfig.dataviz_type = t[1];
                    }
                })
            } else {
                _exitingConfig = false;
            }
            _configureWizardOptions();
            if (_exitingConfig) {
                _applyDatavizConfig(_exitingConfig);
                setTimeout(_onValidateConfig, 500);
            }
        } else {
            _getSampleData(datavizId);
        }


    };

    var _onValidateConfig = function () {
        var dataviz = $("#wizard-panel").attr("data-related-id");
        var type = $("#w_dataviz_type").val();
        if (type) {
            var attributes = [];
            var properties = {
                "id": dataviz
            };
            $(".dataviz-attributes").each(function(id, attribute) {
                var val = $(attribute).val();
                var prop = $(attribute).attr("data-prop");
                if (val && val.length >= 1) {
                    attributes.push("data-" + prop + '="' + val + '"');
                    attributes.push({"prop" : prop, "value": val});
                    properties[prop] = val;
                }
            });
            ["colors", "label"].forEach(function(prop) {
                if (properties[prop]) {
                    properties[prop] = properties[prop].split(",");
                }
            });

            ["columns"].forEach(function(prop) {
                if (properties[prop]) {
                    properties[prop] = properties[prop].split(",").map(function(val) {
                        return Number(val) - 1;
                    });
                }
            });

            var elem = $.parseHTML(composer.activeModel().dataviz_models[type].replace("{{dataviz}}", dataviz));
            attributes.forEach(function(attribute) {
                $(elem).find(".dataviz").attr("data-" + attribute.prop, attribute.value);
            });

            //icon
            var icon = $(elem).find(".dataviz").attr("data-icon");
            if (icon && type === "figure" ) {
                var element = $(elem).find(".dataviz")[0];
                //remove existing icon class eg icon-default
                element.classList.forEach(className => {
                    if (className.startsWith('icon-')) {
                        element.classList.remove(className);
                    }
                });
                //add icon class
                element.classList.add(icon);
                element.classList.add("custom-icon");
            }

            $("#wizard-result div").remove();
            $("#wizard-result").append(elem);
            $("#wizard-code").text(elem[0].outerHTML);
            var fdata = {};
            fdata[dataviz] = _data;
            report.testViz(fdata, type, properties);
        }
    };



    var _init = function() {
        $.ajax({
            url: "html/wizard.html",
            dataType: "text",
            success: function(html) {
                $("body").append(html);
                //Events management
                $('#wizard-panel').on('show.bs.modal', _onWizardOpened);
                $("#w_dataviz_type").change(function() {
                    _onChangeDatavizType();
                });
                $("#wizard_validate").click(_onValidateConfig);
            }
        });

    };




    /*
     * Public
     */

    return {

        init: _init,
        configureDataviz: _configureDataviz,
        loadConfig: _loadConfig

    }; // fin return

})();