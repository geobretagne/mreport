composer = (function () {
    /*
     * Private
     */

    var _blocs = [];

    var dataviz_models = {};

    var _row_template = [
        '<div class="lyrow list-group-item">',
            '<span class="remove badge badge-danger">',
                '<i class="fas fa-times"></i> remove',
            '</span>',
            '<span class="preview">',
                '{{{preview}}}',
            '</span>',
            '<span class="drag badge badge-default">',
                '<i class="fas fa-arrows-alt"></i> drag',
            '</span>',
            '<div class="view">{{{view}}}</div>',
        '</div>'
        ].join("");

    var _initComposer = function () {

        $.ajax({
            url: "html/model-a.html",
            dataType: "text",
            success: function(html) {
                $(html).find("bloc").find(".model-a").each(function (id, elem) {
                    var preview = elem.getAttribute("data-model-title");
                    _blocs.push({"view": elem.outerHTML, "preview": preview});
                });
				var structure = [];
                _blocs.forEach(function(elem) {
                    structure.push(_row_template.replace("{{{view}}}", elem.view).replace("{{{preview}}}", elem.preview));
                });
                console.log(structure.join(""));
                $("#structure-models").append(structure);
                //Retrieve all dataviz models
                ["figure", "chart", "table"].forEach(function(model) {
                    var element = $(html).find("model.report-" + model);
                    dataviz_models[model] = $.trim(element.html());
                });
                console.log(dataviz_models);

            },
            error: function(xhr, status, err) {
                _alert("Erreur avec le fichier html/model-a.html " + err, "danger", true);
            }
        });

        new Sortable(document.getElementById("report-composition"), {
            handle: '.drag', // handle's class
            group:'structure',
            animation: 150,
            onAdd: function (/**Event*/evt) {
                _makeRowSortable(evt.item);
            }
        });

        new Sortable(document.getElementById("structure-models"), {
            handle: '.drag', // handle's class
            dragClass: "sortable-drag",
            group: {
                name: 'structure',
                pull: 'clone',
                put: false // Do not allow items to be put into this list
            },
            animation: 150,
            sort: false // To disable sorting: set sort to false
        });

        new Sortable(document.getElementById("dataviz-items"), {
            group:'dataviz',
            animation: 150
        });

        $("#btn_save_report").click(function (e) {
            _save();
        });

        $("#selectedReportComposer").change(function (e) {
            $("#report-composition .lyrow").remove();
            var reportId = $( this ).val();
            var title = admin.getReportData(reportId).title;
            $("#composer-report-title").text(reportId);
            //Update dataviz list
            var lst = [];
            var dataviz_lst = admin.getReportData(reportId).dataviz;
            dataviz_lst.forEach(function (dvz) {
                if (dvz != null)
                    lst.push(['<li data-dataviz="' + dvz + '" data-report="' + reportId + '" class="dataviz list-group-item">',
                    '<div class="tool"><button class="btn btn-default" data-toggle="modal" data-related-id="'+dvz+'" ',
                    'data-target="#wizard-panel"><i class="fas fa-cog"></i></button></div>',
                    '<span>' + dvz + '</div><code></code>'].join(""));
            });
            $("#dataviz-items .dataviz.list-group-item").remove();
            $("#dataviz-items").append(lst.join(""));
        });
    };

    var _makeRowSortable = function(row) {
        $(row).find(".column").each(function(id, col) {
            new Sortable(col, {
                group:'dataviz',
                animation: 150
            });
        });
        //enable remove buton
        $(row).find(".remove").click(function(e) {
            //keep existing dataviz
            $(e.currentTarget).closest(".lyrow").find(".dataviz").appendTo("#dataviz-items");
            $(e.currentTarget).closest(".lyrow").remove();
        });
    };

    var _exportHTML = function () {
        var html = [];

        $("#report-composition .row.model-a").each(function(id,row) {
            var tmp_row = $(row).clone();
            //delete extra row attributes
            ["data-model-title","data-model-description"].forEach(function(attr) {
                $(tmp_row).removeAttr(attr)
            });
            // loop on columns
            $(tmp_row).find(".column").each(function(id,col) {
               var dvz = $(col).find("code").text();
               $(col).html(dvz);
            });
            html.push($(tmp_row).get(0).outerHTML);
        });
        return html.join("\n");
    };

    var _compose = function (reportId) {
        $("#btn-composer").click();
        $('#selectedReportComposer option[value="' + reportId + '"]').prop('selected', true).trigger("change");
    }

    var _save = function () {
		var _report = $("#selectedReportComposer").val();
		var newDom = _exportHTML();
		$.ajax({
            type: "POST",
            url: [_api_url, "report_html", _report].join("/"),
            data: newDom,
            dataType: 'json',
            contentType: 'text/html',
            success: function( response ) {
				if (response.response === "success") {
					console.log("Sauvegarde réussie");
				} else {
					alert("enregistrement échec :" + response.response)
				}

			},
			error: function( a, b, c) {
				console.log(a, b, c);
			}
		});


	};


    return {
        initComposer: _initComposer,
        exportHTML: _exportHTML,
        compose: _compose,
        models: function () { return dataviz_models;}
    }; // fin return

})();

$(document).ready(function () {
    composer.initComposer();
    wizard.init();
});