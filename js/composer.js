composer = (function () {
    /*
     * Private
     */

    var _models = [];

    var _row_template = [
        '<div class="lyrow list-group-item">',
            '<span class="remove badge badge-danger">',
                '<i class="fas fa-times"></i> remove',
            '</span>',
            '<span class="preview">',
                '<!--<input type="text" value="6 6" placeholder="Enter your own" class="form-control">-->',
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
                $(html).find(".model-a").each(function (id, elem) {
                    var preview = elem.getAttribute("data-model-title");
                    _models.push({"view": elem.outerHTML, "preview": preview});
                });
				var structure = [];
                _models.forEach(function(elem) {
                    structure.push(_row_template.replace("{{{view}}}", elem.view).replace("{{{preview}}}", elem.preview));
                });
                console.log(structure.join(""));
                $("#structure-models").append(structure);
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
            console.log(_exportHTML());
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
        $("#report-composition .view").each(function(id,element) {
            html.push(element.innerHTML);
        });
        return html.join("\n");
    };


    return {
        initComposer: _initComposer,
        exportHTML: _exportHTML
    }; // fin return

})();

$(document).ready(function () {
    composer.initComposer();
});