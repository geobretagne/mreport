composer = (function () {
    /*
     * Private
     */

    var _models = {};

    var _activeModel = "";

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

    var _selectModel = function (m) {
        _activeModel = m;
        $("#structure-models .list-group-item").remove();
        $("#structure-models").append(_models[m].structure);
    }

    var _initComposer = function () {
        ["a","b"].forEach(function(m) {
            $.ajax({
                url: "html/model-" + m + ".html",
                dataType: "text",
                success: function(html) {
                    //Template parsing
                    var page = $(html).find("template.report").get(0).content.firstElementChild;
                    var colors = [];
                    if ($(page).find(".report").attr("data-composer-colors")) {
                        colors = $(page).find(".report").attr("data-composer-colors").split(",");
                    }
                    var blocs = [];
                    $(html).find("template.report-bloc").each(function (id, template) {
                        var elem = $(template).prop('content').firstElementChild;
                        var preview = elem.getAttribute("data-model-title");
                        blocs.push({"view": elem.outerHTML, "preview": preview});
                    });
                    var structure = [];
                    blocs.forEach(function(elem) {
                        structure.push(_row_template.replace("{{{view}}}", elem.view).replace("{{{preview}}}", elem.preview));
                    });
                    //Retrieve all dataviz models
                    var dataviz_models = {};
                    ["figure", "chart", "table"].forEach(function(model) {
                        var element = $(html).find("template.report-component.report-" + model).prop('content').firstElementChild;
                        dataviz_models[model] = $.trim(element.outerHTML);
                    });
                    _models[m] = {page: page, blocs: blocs, structure: structure, dataviz_models: dataviz_models, colors: colors};
                    $("#selectedModelComposer").append('<option value="'+m+'">'+m+'</option>');

                },
                error: function(xhr, status, err) {
                    _alert("Erreur avec le fichier html/model-" + m + ".html " + err, "danger", true);
                }
            });
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
                    lst.push(['<li data-dataviz="' + dvz + '" title="'+dvz+'" data-report="' + reportId + '" class="dataviz list-group-item">',
                    '<div class="tool"><button class="btn btn-default" data-toggle="modal" data-related-id="'+dvz+'" ',
                    'data-target="#wizard-panel"><i class="fas fa-cog"></i></button></div>',
                    '<span>' + dvz + '</span></div><code></code>'].join(""));
            });
            $("#dataviz-items .dataviz.list-group-item").remove();
            $("#dataviz-items").append(lst.join(""));
        });

        $("#selectedModelComposer").change(function (e) {
            _selectModel($( this ).val());
        });

        $('#text-edit').on('show.bs.modal', _onTextEdit);

    };

    var _onTextEdit = function(a) {
        var source = a.relatedTarget.parentNode.firstChild;
        var btn = $(a.currentTarget).find(".btn-primary");
        $(btn).click(function(e) {
            console.log(source);
            var text = $("#text-edit-value").val();
            source.nodeValue = text;
        });

    };

    var _makeRowSortable = function(row) {
        $(row).find(".dataviz-container").each(function(id, col) {
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
        // add edit button
        var btn = $(row).find(".bloc-title").append('<span data-toggle="modal" data-target="#text-edit" class="to-remove text-edit badge badge-warning"><i class="fas fa-edit"></i> edit</span>').find(".text-edit");

    };

    var _exportHTML = function () {
        var html = [];
        $("#report-composition .report-bloc").each(function(id,bloc) {
            var tmp_bloc = $(bloc).clone();
            //delete extra row attributes
            ["data-model-title","data-model-description"].forEach(function(attr) {
                $(tmp_bloc).removeAttr(attr);
            });
            //delete extra controls
            $(tmp_bloc).find(".to-remove").remove();
            // loop on dataviz-container
            $(tmp_bloc).find(".dataviz-container").each(function(id,container) {
               var dvz = $(container).find("code").text();
               $(container).html(dvz);
            });
            html.push($(tmp_bloc).get(0).outerHTML);
        });

        var _export = $(_models[_activeModel].page).clone().find(".report").append(html.join("\n")).parent();

        return _export.get(0).outerHTML;
    };

    var _compose = function (reportId) {
        $("#btn-composer").click();
        $('#selectedReportComposer option[value="' + reportId + '"]').prop('selected', true).trigger("change");
    }

    var _save = function () {
		var _report = $("#selectedReportComposer").val();
		var newDom = _exportHTML();
        console.log(newDom);
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
        colors: function () { return _models[_activeModel].colors;},
        activeModel: function () { return _models[_activeModel];},
        models: function () { return _models;}
    }; // fin return

})();

$(document).ready(function () {
    composer.initComposer();
    wizard.init();
});