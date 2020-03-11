admin = (function () {
    /*
     * Private
     */

    var _dataviz_data = {};

    var _report_data = {};

    /* convert [{id:"a"; msg:"xxx"}, {id:"b"; msg:"yyy"}] into
        {
            a: {id:"a"; msg:"xxx"},
            b: {id:"b"; msg:"yyy"}
        }
    */
    var _arr2dic = function (arr, key) {
        var dic = {};
        arr.forEach(function (item) {
            dic[item[key]] = item;
        });
        return dic;
    };

    var _initMenu = function() {
        $("ul.navbar-nav li").each(function () {
          $(this).on("click", function () {
            $(".container-fluid.page, .nav-item").removeClass("active");
            $("#" + $(this).attr("data-page")).addClass("active");
            $(this).addClass("active");
          });
        });
    };

    var _initReports = function () {
        $.ajax({
            dataType: "json",
            url: [report.getAppConfiguration().api, "report"].join("/"),
            success: function (data) {
                _report_data = _arr2dic(data.reports, "report");
                _appendReports();
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                Swal.fire(
                    'Une erreur s\'est produite',
                    err.response,
                    'error'
                );
            }
        });
        $('#report-modal-form').on('show.bs.modal', function (e) {
            $(".reports-dataviz .list-group-item").remove();
            var lst = [];
            var newReport = $(e.relatedTarget).attr('data-report-state');
            $(e.currentTarget).attr("data-report-state", newReport);
            var title = $(e.currentTarget).find('input[name="title"]');
            var confirmed = $("#report_confirmed");

            if (newReport === "edit") {
                //get data-id attribute of the clicked element
                var reportId = $(e.relatedTarget).data('report-id');
                confirmed.attr("data-report-id", reportId)
                var data = _report_data[reportId];
                //populate data
                title.val(data.title);
                title.prop("disabled", false);
                //data.dataviz = ['epci_title', 'epci_pop'];
                data.dataviz.forEach(function (dvz) {
                    if (dvz != null)
                        lst.push('<li data-dataviz="' + dvz + '" data-report="' + reportId + '" class="list-group-item item2keep"><span>' + dvz + '</span><button type="button" class="btn btn-delete btn-danger">Delete</button></li>');
                });
                confirmed.attr("onclick", "admin.updateReport();");
                confirmed.html("Enregistrer");
            } else if (newReport === "new") {
                title.prop("disabled", false);
                $("input.dataviz-selection:checked").each(function (id, dvz) {
                    var id = $(dvz).closest(".card.dataviz").attr("data-dataviz-id");
                    lst.push('<li data-dataviz="' + id + '" class="list-group-item">' + id + '</li>');
                });
                confirmed.attr("onclick", "admin.addReport();");
                confirmed.attr("data-report-id", reportId)
                confirmed.html("Enregistrer");
            } else {
                var reportId = $(e.relatedTarget).data('report-id');
                var data = _report_data[reportId];
                title.val(data.title);
                title.prop("disabled", true);
                data.dataviz.forEach(function (dvz) {
                    if (dvz != null)
                        lst.push('<li data-dataviz="' + dvz + '" data-report="' + reportId + '" class="list-group-item">' + dvz);
                });
                confirmed.attr("onclick", "admin.deleteReport();");
                confirmed.attr("data-report-id", reportId)
                confirmed.html("Supprimer");
            }
            $(".reports-dataviz").append(lst.join(""));

            $(".reports-dataviz .btn-delete").click(function (e) {
                var item = $(this).parent();
                item.toggleClass("item2keep");
                if (item.hasClass("item2keep")){
                    $(this).text("Delete")
                    $(this).removeClass("btn-success");
                    $(this).addClass("btn-danger");
                }
                else{
                    $(this).text("Keep");
                    $(this).removeClass("btn-danger");
                    $(this).addClass("btn-success");
                }
                    

            });
        });
        $('#report-modal-form2').on('show.bs.modal', function (e) {
            $(".reports-dataviz-exist .list-group-item").remove();
            var lst = []
            $("input.dataviz-selection:checked").each(function (id, dvz) {
                var id = $(dvz).closest(".card.dataviz").attr("data-dataviz-id");
                lst.push('<li data-dataviz="' + id + '" class="list-group-item">' + id + '</li>');
            });
            $(".reports-dataviz-exist").append(lst.join(""));
        });
    };

    var _appendReports = function () {

        var cards = [];
        var options = ['<option value="" selected disabled>Rapport...</option>'];
        $("#reports .row").remove();
        Object.entries(_report_data).forEach(function (a) {
            var id = a[0];
            var data = a[1];
            cards.push(
                ['<div class="col-md-3 col-sm-12 cards">',
                    '<div class="card report" data-dataviz-id="' + id + '">',
                    '<div class="card-body">',
                    '<h5 class="card-title">' + data.title + '</h5>',
                    '<a href="#" class="card-link" data-toggle="modal" data-report-state="edit" data-report-id="' + id + '" data-target="#report-modal-form">Sourcer</a>',
                    '<a href="#" class="card-link" data-toggle="modal" data-report-state="delete" data-report-id="' + id + '" data-target="#report-modal-form">Supprimer</a>',
                    '<a href="./' + id + '" target="_blank" class="card-link">Afficher</a>',
                    '<a href="#" onclick="composer.compose(\''+id+'\')" class="card-link">Composer</a>',
                    '</div>',
                    '</div>',
                    '</div>'
                ].join("")
            );
            options.push('<option value="' + id + '">' + data.title + '</option>');
        });

        $("#reports").append('<div class="row">' + cards.join("") + '</div>');
        $("#selectedReport, #selectedReportComposer").html(options.join(""));
    };

    var _showDataviz = function () {

        var cards = [];
        $("#catalog .row:nth-of-type(2)").remove();
        Object.entries(_dataviz_data).forEach(function (a) {
            var id = a[0];
            var data = a[1];
            cards.push(
                ['<div class="col-md-3 col-sm-12 cards">',
                    '<div class="card dataviz" data-dataviz-id="' + id + '">',
                        '<div class="card-body">',
                            '<h5 class="card-title">' + data.title + '</h5>',
                            '<h6 class="card-subtitle mb-2 text-muted"><span class="badge badge-info">' + data.level + '</span><span class="badge badge-warning">' + data.job + '</span></h6>',
                            '<p class="card-text">' + data.description + '</p>',
                            '<div class="custom-control custom-checkbox mb-3">',
                                '<input type="checkbox" id="' + id + '-selection" class="dataviz-selection custom-control-input" name="dataviz-selection">',
                                '<label class="custom-control-label" for="' + id + '-selection">Sélectionner</label>',
                            '</div>',
                            '<a href="#" data-dataviz-state="edit" class="card-link" data-toggle="modal" data-related-id="' + id + '" data-target="#dataviz-modal-form">Editer</a>',
                            '<a href="#" data-dataviz-state="delete" class="card-link" data-toggle="modal" data-related-id="' + id + '" data-target="#dataviz-modal-form">Supprimer</a>',
                        '</div>',
                    '</div>',
                '</div>'
                ].join("")
            );
        });
        $("#catalog").append('<div id="dataviz-cards" class="row">' + cards.join("") + '</div>');
        /* Add event to all checkbox to add them into the cart */
        $('input[type="checkbox"]').change(function(){
            var id = $(this).parent().parent().parent().data().datavizId;
            if($(this).is(":checked")) {
                $("#cd-cart .cd-cart-items").append(
                    "<li data-dataviz-id="+id+">\
                        "+$(this).parent().parent().find("h5")[0].outerHTML+"\
                        "+$(this).parent().parent().find("h6")[0].outerHTML+"\
                        <a href='#0' class='cd-item-remove cd-img-replace'>Remove</a>\
                    </li>"
                );
            }else{
                $("#cd-cart .cd-cart-items li[data-dataviz-id|="+id+"]").remove();          
            }
            $(".green .number").html($(".cd-cart-items li").length);
        });
        /* Remove event from the 'select all' checkbox because we do not want to add it to the cart */
        $("#checkAll").off("change");
        /* Bind event to dynamically generated cart items in order to delete them from the cart and unselect 
        them in the list */
        $(document).on('click',"#cd-cart .cd-cart-items li .cd-item-remove",function(){
            var id = $(this).parent().data().datavizId;
            $("#dataviz-cards div[data-dataviz-id|="+id+"] input[type='checkbox']").prop('checked',false);
            $(this).parent().remove();
            $(".green .number").html($(".cd-cart-items li").length);
            
        });
    };

    var _populateForm = function (formId, data) {
        for (let [key, value] of Object.entries(data)) {
            $(formId + ' .form-control[name="' + key + '"]').val(value);
        }
    };
    var _filterSearchBar = function (result, divs) {

    };
    var _initCatalog = function () {
        $.ajax({
            dataType: "json",
            url: [report.getAppConfiguration().api, "store"].join("/"),
            success: function (data) {
                _dataviz_data = _arr2dic(data.datavizs, "dataviz");
                _showDataviz();
                var options = {
                    tokenize: true,
                    threshold: 0.2,
                    location: 0,
                    distance: 200,
                    maxPatternLength: 40,
                    minMatchCharLength: 1,
                    keys: [
                        "title",
                        "description",
                        "year",
                        "level",
                        "source",
                        "job"
                    ]
                };
                var fuse = new Fuse(data.datavizs, options);
                $("#searchbar").on("keyup", function () {
                    $("#checkAll").prop('checked', false);
                    var result = fuse.search($(this).val());
                    var divs = $(".card.dataviz");
                    if ($(this).val() != "") {
                        divs.parent().addClass("hidden");
                        result.forEach(function (elem) {
                            divs.each(function () {
                                if (elem.dataviz == $(this).attr("data-dataviz-id")) {
                                    $(this).parent().removeClass("hidden");
                                }
                            });
                        });
                    } else {
                        divs.parent().removeClass("hidden");
                    }
                });
            },
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                Swal.fire(
                    'Une erreur s\'est produite',
                    err.response,
                    'error'
                );
            }
        });
        $('#dataviz-modal-form').on('show.bs.modal', function (e) {
            var newDataviz = $(e.relatedTarget).attr('data-dataviz-state');
            $(e.currentTarget).attr("data-dataviz-state", newDataviz);
            var title = $(e.currentTarget).find('.form-control');
            var confirmed = $("#dataviz_confirmed");
            if (newDataviz === "edit") {
                confirmed.attr("onclick", "admin.updateDataviz();");
                title.prop("disabled", false);
                confirmed.html("Enregistrer");
            } else if (newDataviz === "delete") {
                confirmed.attr("onclick", "admin.deleteDataviz();");
                title.prop("disabled", true);
                confirmed.html("Supprimer");
            }
            var datavizId = $(e.relatedTarget).attr('data-related-id');
            $(e.currentTarget).attr("data-related-id", datavizId);
            $(e.currentTarget).find(".dataviz-title").text(datavizId);
            _populateForm('#dataviz-form', _dataviz_data[datavizId]);
        });
        /* Select all visible items in the list and trigger the cahnge event on checkbox to add them in the cart */
        $("#checkAll").click(function () {
            var dvz = $("#dataviz-cards .cards:not(.hidden) .dataviz-selection");
            var checked = $(this).prop('checked');
            dvz.each(function(){
                if(!$(this).prop('checked')==checked){
                    $(this).prop('checked',checked).trigger('change');
                }
                else{
                    $(this).prop('checked',checked);
                }
            });
        });
        /* Reset all inputs and cart */
        $("#resetfilters").click(function () {
            $(".dataviz-selection").prop('checked', false).trigger("change");
            $("#checkAll").prop('checked', false);
            $("#searchbar").val("").trigger("keyup");
        });
        /* Toggle the cart to appear */
        $(".green").click(function(){
            $("#cd-cart").toggleClass("speed-in");
        });
        /* Toggle the cart to disappear */
        $("#togglePanier").click(function(){
            $("#cd-cart").toggleClass("speed-in");
        });
        
    };

    _addDatavizToReport = function (report_id, report_data) {
        $.ajax({
            dataType: "json",
            contentType: "application/json",
            type: "PUT",
            data: JSON.stringify(report_data),
            url: [report.getAppConfiguration().api, "report_composition", report_id].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    //update local data
                    console.log(data.report_composition);
                    _initReports();

                } else {
                    console.log(data);
                }
            },
            error: function (xhr, status, error) {
                $('#report-modal-form').modal('hide');
                var err = eval("(" + xhr.responseText + ")");
                Swal.fire(
                    'Une erreur s\'est produite',
                    err.response,
                    'error'
                );
            }
        });
    };

    _addReport = function () {
        var report_name = $("#reportInputTitre").val();
        var report_id = report_name.replace(/[^\w\s]/gi, '').toLowerCase().replace(/ /g, "");
        //Create Report in db
        $.ajax({
            dataType: "json",
            contentType: "application/json",
            type: "PUT",
            data: JSON.stringify({
                "title": report_name
            }),
            url: [report.getAppConfiguration().api, "report", report_id].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    //update local data
                    console.log(data.report);
                    //add dataviz to report

                    var datavizs = [];
                    $(".reports-dataviz .list-group-item").each(function (id, dvz) {
                        datavizs.push({
                            "dataviz": $(dvz).attr("data-dataviz")
                        });
                    });
                    if (datavizs.length > 0) {
                        _addDatavizToReport(data.report, datavizs);
                    } else {
                        _initReports();
                    }
                    $('#report-modal-form').modal('hide');
                    Swal.fire({
                        title: 'Créé',
                        text: "Le rapport \'" + report_name + "'\' a été créé",
                        icon: 'success',
                        showCancelButton: true,
                        cancelButtonText: 'Ok',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#32CD32',
                        confirmButtonText: 'Composeur'
                    }).then((result) => {
                        if (result.value) {
                            window.open('./' + report_id,"_blank");
                        }
                    });

                } else {
                    console.log(data);
                }
            },
            error: function (xhr, status, error) {
                $('#report-modal-form').modal('hide');
                var err = eval("(" + xhr.responseText + ")");
                Swal.fire(
                    'Une erreur s\'est produite',
                    err.response,
                    'error'
                );
            }
        });

    };
    _createReport = function () {
        var report_id = $("#selectedReport").val();
        var report_name = $("#selectedReport option[value=" + report_id + "]").text();
        var datavizs = [];
        $(".reports-dataviz-exist .list-group-item").each(function (id, dvz) {
            datavizs.push({
                "dataviz": $(dvz).attr("data-dataviz")
            });
        });
        $.ajax({
            dataType: "json",
            contentType: "application/json",
            type: "PUT",
            data: JSON.stringify(datavizs),
            url: [report.getAppConfiguration().api, "report_composition", report_id].join("/"),
            success: function (data) {
                $('#report-modal-form2').modal('hide');
                Swal.fire(
                    'Modifié',
                    'Le rapport \'' + report_name + '\' a été modifié',
                    'success'
                )
                _initReports();
            },
            error: function (xhr, status, error) {
                $('#report-modal-form2').modal('hide');
                var err = eval("(" + xhr.responseText + ")");
                Swal.fire(
                    'Une erreur s\'est produite',
                    err.response,
                    'error'
                )
            }
        });


    }
    _deleteDatavizFromReport = function (dataviz2delete, report_id, report_name) {
        var resultArray = [];
        dataviz2delete.each(function () {
            resultArray.push({
                "dataviz": $(this).text()
            });
        });
        $.ajax({
            dataType: "json",
            contentType: "application/json",
            type: "DELETE",
            data: JSON.stringify(resultArray),
            url: [report.getAppConfiguration().api, "report_composition", report_id].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    $('#report-modal-form').modal('hide');
                    Swal.fire(
                        'Modifié',
                        'Le rapport \'' + report_name + '\' a été modifié',
                        'success'
                    )
                    _initReports();

                } else {
                    console.log(data);
                }
            },
            error: function (xhr, status, error) {
                $('#report-modal-form').modal('hide');
                var err = eval("(" + xhr.responseText + ")");
                Swal.fire(
                    'Une erreur s\'est produite',
                    err.response,
                    'error'
                );
            }
        });
    }
    _updateReport = function () {
        var report_name = $("#reportInputTitre").val();
        var report_id = $("#report_confirmed").attr("data-report-id");
        var dataviz2delete = $(".reports-dataviz li:not(.item2keep) span");

        $.ajax({
            dataType: "json",
            contentType: "application/json",
            type: "POST",
            data: JSON.stringify({
                "title": report_name
            }),
            url: [report.getAppConfiguration().api, "report", report_id].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    //update local data
                    if (dataviz2delete.length > 0) {
                        _deleteDatavizFromReport(dataviz2delete, report_id, report_name);
                    } else {
                        $('#report-modal-form').modal('hide');
                        Swal.fire(
                            'Modifié',
                            'Le rapport \'' + report_name + '\' a été modifié',
                            'success'
                        )
                        _initReports();
                    }


                } else {
                    console.log(data);
                }
            },
            error: function (xhr, status, error) {
                $('#report-modal-form').modal('hide');
                var err = eval("(" + xhr.responseText + ")");
                Swal.fire(
                    'Une erreur s\'est produite',
                    err.response,
                    'error'
                )
            }
        });

    };
    _deleteReport = function () {
        var report_name = $("#reportInputTitre").val();
        var report_id = $("#report_confirmed").attr("data-report-id");
        //Delete Report in db
        Swal.fire({
            title: 'Voulez vous supprimer le rapport \'' + report_name + '\' ?',
            text: "Vous ne pourrez pas revenir en arrière !",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmer'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    dataType: "json",
                    contentType: "application/json",
                    type: "DELETE",
                    url: [report.getAppConfiguration().api, "report", report_id].join("/"),
                    success: function (data) {

                        $('#report-modal-form').modal('hide');
                        Swal.fire(
                            'Supprimé',
                            'Le rapport \'' + report_name + '\' a été supprimé',
                            'success'
                        )
                    },
                    complete: function () {
                        _initReports();
                    },
                    error: function (xhr, status, error) {
                        $('#report-modal-form').modal('hide');
                        var err = eval("(" + xhr.responseText + ")");
                        Swal.fire(
                            'Une erreur s\'est produite',
                            err.response,
                            'error'
                        )
                    }
                });

            }
        })


    };
    _deleteDataviz = function () {
        var dataviz_title = $(".dataviz-title").first().text();
        //Delete Report in db
        Swal.fire({
            title: 'Voulez vous supprimer la dataviz \'' + dataviz_title + '\' ?',
            text: "Vous ne pourrez pas revenir en arrière !",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmer'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    dataType: "json",
                    contentType: "application/json",
                    type: "DELETE",
                    url: [report.getAppConfiguration().api, "store", dataviz_title].join("/"),
                    success: function (data) {
                        Swal.fire(
                            'Supprimée',
                            'La dataviz \'' + dataviz_title + '\' a été supprimée',
                            'success'
                        )
                        var dvz = _dataviz_data[data.dataviz];
                        $.extend(dvz, data.data);
                        $('#dataviz-modal-form').modal('hide');
                    },
                    complete: function () {
                        _initCatalog();
                    },
                    error: function (xhr, status, error) {
                        $('#dataviz-modal-form').modal('hide');
                        var err = eval("(" + xhr.responseText + ")");
                        Swal.fire(
                            'Une erreur s\'est produite',
                            err.response,
                            'error'
                        )
                    }
                });

            }
        })


    };
    _updateDataviz = function () {
        var id = $("#dataviz-modal-form").attr("data-related-id");
        b = {};
        a = $("#dataviz-form").serializeArray();
        a.forEach(function (r) {
            if (r.value) {
                b[r.name] = r.value;
            }
        });
        $.ajax({
            dataType: "json",
            contentType: "application/json",
            url: [report.getAppConfiguration().api, "store", id].join("/"),
            type: "POST",
            data: JSON.stringify(b),
            success: function (data) {
                if (data.response === "success") {
                    //update local data
                    Swal.fire(
                        'Modifiée',
                        'La Dataviz \'' + id + '\' a été modifiée',
                        'success'
                    )
                    var dvz = _dataviz_data[data.dataviz];
                    $.extend(dvz, data.data);
                    $('#dataviz-modal-form').modal('hide');
                } else {
                    console.log(data);
                }
            },
            complete: function () {
                _initCatalog();
            },
            error: function (xhr, status, error) {
                $('#dataviz-modal-form').modal('hide');
                var err = eval("(" + xhr.responseText + ")");
                Swal.fire(
                    'Une erreur s\'est produite',
                    err.response,
                    'error'
                )
            }
        });

    };

    var _getReportData = function (reportId) {
        return _report_data[reportId];
    };


    /*
     * Public
     */

    return {
        initCatalog: _initCatalog,
        initReports: _initReports,
        initMenu: _initMenu,
        addReport: _addReport,
        updateReport: _updateReport,
        deleteReport: _deleteReport,
        deleteDataviz: _deleteDataviz,
        updateDataviz: _updateDataviz,
        createReport: _createReport,
        getReportData: _getReportData
    }; // fin return

})();

$(document).ready(function () {
    admin.initCatalog();
    admin.initReports();
    admin.initMenu();
});