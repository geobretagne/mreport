wizard = (function() {
    /*
     * Private
     */
    var _data;

	_notSavedDataviz = [];

    _api_url = "http://localhost/api"

    var _showIndicateurProperties = function(ind) {
        $(".wizard-code").hide();
        $("#dataviz-attributes").hide();
        $(".dataviz-attributes").val("");
        $("#wizard-result div").remove();
        $("#w_dataviz_type").val("");
        $("#wizard-code").text("");
        $("#wizard-parameters").attr("data-dataviz", ind);
        var options;
        var data = _data[ind];
        var dataset_nb = data.dataset.length;
        var data_nb = data.rows;
        var data_type = "text";
        var significative_label = data.significative_label;
        if (data.dataset.length === 1) {
            var _url = new RegExp(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);
            if (_url.test(data.data[0])) {
                data_type = "url";
            }
            /*var _img = new RegExp(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/);
            if (_img.test(data.data[0])) {
                data_type = "image";
            }*/

        }
        var options = [];
        if (dataset_nb > 1) {
            options.push("table");
            if (significative_label) {
                options.push("chart");
            }
        } else {
            if (data_nb === 1) {
                // une seule ligne
                if (data_type === "text") {
                    options.push("figure");
                } else if (data_type === "url") {
                    options.push("iframe");
                    options.push("image");
                }
            } else {
                // plusieurs lignes
                options.push("chart");
            }
        }
        var dataviz_options = ['<option class="dataviz-options" selected disabled>...</option>'];
        options.forEach(function(option) {
            dataviz_options.push('<option  class="dataviz-options" value="' + option + '">' + option + '</option>');
        });

        $("#w_dataviz_type .dataviz-options").remove();
        $("#w_dataviz_type").append(dataviz_options.join(""));



        return {
            "datasets": dataset_nb,
            "rows": data_nb,
            "significative_labels": significative_label
        };


    };

    var _showIndicateurs = function() {
        var dispo = [];
        $.each(_data, function(indicateur, properties) {
            if (!document.getElementById(indicateur)) {
                dispo.push(indicateur);
            }
        });
        $("#wizard-indicateurs .list-group-item").remove();
        dispo.forEach(function(item) {
            $("#wizard-indicateurs").append('<button type="button" data-indicateur="' + item + '" class="list-group-item list-group-item-action">' + item + '</button>');
        });
        $("#wizard-indicateurs button").click(function(e) {
            $("#wizard-indicateurs button").removeClass("active");
            var btn = $(e.currentTarget);
            btn.addClass("active");
            var metadata = _showIndicateurProperties(btn.attr("data-indicateur"));
            $("#indicateur-metadata").html("<code>" + [metadata.datasets + " datasets disponible(s)",
                metadata.rows + " lignes",
                "Labels utilisables " + metadata.significative_labels
            ].join("<br>") + "</code>");

        });
        $("#dataviz-attributes").hide();

    };

    _autoConfig = function(id, dataviz) {
        var colors = ["#e55039", "#60a3bc", "#78e08f", "#fad390"];
        var significative_label = _data[id].significative_label;
        var nb_datasets = _data[id].dataset.length;
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
                    $("#w_label").val(_data[id].dataset.join(","));
                }
                break;
            case "table":
                $("#w_label").val(_data[id].dataset.join(","));
                $("#w_table_column").val(columns.join(","));
                if (significative_label) {
                    $("#w_table_extracolumn").val("#");
                    $("#w_table_extracolumn").closest(".input-group").show();
                } else {
                    $("#w_table_extracolumn").closest(".input-group").hide();
                }
                break;

        }
    };

	var _addDataviz = function () {
		var html = ['<div class="row">',
			'<div class="wz-temp col-xs-6 col-md-6">',
			'<h5>Title</h5>',
		'</div></div>'].join("");
		$("body>.report").append(html);

		var html_definition = ['<div class="row">',
			'<div class="col-xs-6 col-md-6">',
			'<h5>Title</h5>',
			$("#wizard-code").text(),
		'</div></div>'].join("");

		var parentElement = $( ".wz-temp" ).last().removeClass("wz-temp");
		$("#wizard-result").children().appendTo(parentElement);

		_notSavedDataviz.push(html_definition);
	};

	var _save = function () {
		var _report = report.getReport();
		newElements = _notSavedDataviz.join(" ");
		var newDom = $(_report.html).append(newElements).prop("outerHTML");
		console.log(newDom);
		$.ajax({
            type: "POST",
            url: [_api_url, "report_html", _report.name].join("/"),
            data: newDom,
            dataType: 'json',
            contentType: 'text/html',
            success: function( response ) {
				if (response.response === "success") {
					 _notSavedDataviz = [];
					document.location.reload(true);
				} else {
					alert("enregistrement échec :" + response.response)
				}

			},
			error: function( a, b, c) {
				console.log(a, b, c);
			}
		});


	};


    var _init = function(data) {
        _data = data;
        $.ajax({
            url: "html/wizard.html",
            dataType: "text",
            success: function(html) {
                $("body").append(html);
                $("body").append('<div class="wizard"><button class="wizard-btn btn btn-primary btn-lg" data-toggle="modal" data-target="#wizard-panel">+</button></div>');
				$("body").append('<div class="wizard2"><button class="wizard-btn2 btn btn-success btn-lg" onclick="wizard.save();" >Save</button></div>');
                $(".wizard-btn").click(function(e) {
                    _showIndicateurs();
                });
                $("#w_dataviz_type").change(function() {
                    var dataviz = $("#w_dataviz_type").val();
                    $(".dataviz-attributes").val("");
                    var id = $("#wizard-indicateurs button.active").attr("data-indicateur");
                    $("#dataviz-attributes").show();
                    $(".dataviz-attributes").closest(".input-group").hide();
                    $("." + dataviz + ".dataviz-attributes").closest(".input-group").show();
                    _autoConfig(id, dataviz);
                    if (dataviz === "chart") {
                        $("#w_label").closest(".input-group").find(".input-group-text").text("séries");
                    } else if (dataviz === "table") {
                        $("#w_label").closest(".input-group").find(".input-group-text").text("labels");
                    }
                    $("#wizard_validate").click();
                });
                $("#wizard_validate").click(function(e) {
                    var dataviz = $("#wizard-parameters").attr("data-dataviz");
                    var type = $("#w_dataviz_type").val();
                    var attributes = [];
                    var properties = {
                        "id": dataviz
                    };
                    $(".dataviz-attributes").each(function(id, attribute) {
                        var val = $(attribute).val();
                        var prop = $(attribute).attr("data-prop");
                        if (val && val.length >= 1) {
                            attributes.push("data-" + prop + '="' + val + '"');
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

                    $("#" + dataviz).remove();

                    var elem = $('<div id="' + dataviz + '" class="report-' + type + '" ' + attributes.join(" ") + '></div>');
                    if (type === "figure") {
                        elem.append(['<p class="report-figure-chiffre text-center"></p>',
                            '<p class="report-figure-caption text-center"></p>'
                        ].join(""));
                    }
                    $("#wizard-result").append(elem);
                    $("#wizard-code").text(elem.prop("outerHTML"));
                    $(".wizard-code").show();
                    report.testViz(_data, type, properties);
                });
            }
        });

    };




    /*
     * Public
     */

    return {

        init: _init,
		addDataviz: _addDataviz,
		save: _save

    }; // fin return

})();