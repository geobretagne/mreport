admin = (function() {
    /*
     * Private
     */
    var _api_url = "http://localhost/api";

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
        arr.forEach(function(item) {
            dic[item[key]] = item;
        });
        return dic;
    };

    var _initReports = function () {
        $.ajax({
            dataType: "json",
            url: [_api_url, "report"].join("/"),
            success: function(data) {
                _report_data = _arr2dic(data.reports, "report");
                _appendReports();
            },
            error: function(xhr, status, error) {
                var msg = "erreur " + _api_url + " : " + error;
                console.log(msg);
            }
        });
        $('#report-modal-form').on('show.bs.modal', function(e) {
            $(".reports-dataviz .list-group-item").remove();
            var lst = [];
            var newReport = $(e.relatedTarget).attr('data-report-state');
            $(e.currentTarget).attr("data-report-state", newReport);
            var title = $(e.currentTarget).find('input[name="title"]');
            var confirmed = $("#confirmed");
            if (newReport==="edit") {
                //get data-id attribute of the clicked element
                var reportId = $(e.relatedTarget).data('report-id');
                var data= _report_data[reportId];
                //populate data
                title.val(data.title);
                title.prop("disabled", false);
                //data.dataviz = ['epci_title', 'epci_pop'];
                data.dataviz.forEach(function (dvz) {
                    lst.push('<li data-dataviz="'+dvz+'" data-report="'+reportId+'" class="list-group-item">'+dvz+'<a type="button" class="btn btn-delete btn-default btn-danger">DELETE</a></li>');
                });
                confirmed.attr("onclick","admin.addReport();");
                confirmed.html("Enregistrer");
            } else if(newReport==="new") {
                title.prop("disabled", false);
                $("input.dataviz-selection:checked").each(function(id, dvz) {
                    var id = $(dvz).closest(".card.dataviz").attr("data-dataviz-id");
                    lst.push('<li data-dataviz="'+id+'" class="list-group-item">'+id+'</li>');
                });
                confirmed.attr("onclick","admin.addReport();");
                confirmed.html("Enregistrer");
            }
            else{
                var reportId = $(e.relatedTarget).data('report-id');
                var data= _report_data[reportId];
                title.val(data.title);
                title.prop("disabled", true);
                data.dataviz.forEach(function (dvz) {
                    lst.push('<li data-dataviz="'+dvz+'" data-report="'+reportId+'" class="list-group-item">'+dvz);
                });
                confirmed.attr("onclick","admin.deleteReport();");
                confirmed.html("Supprimer");
            }
            $(".reports-dataviz").append(lst.join(""));
            $(".reports-dataviz .btn-delete").click(function(e) {
                e.stopPropagation();
                var element = e.currentTarget.parentElement;
                var datavizid = $(element).attr("data-dataviz");
                var reportid = $(element).attr("data-report");
                var url = [_api_url, "report_composition", reportid].join("/")
                $.ajax({
                    dataType: "json",
                    contentType: "application/json",
                    type:"DELETE",
                    data: JSON.stringify([{"dataviz": datavizid}]),
                    url: [_api_url, "report_composition", reportid].join("/"),
                    success: function(data) {
                        if (data.response === "success") {
                            $(element).remove();
                        } else {
                            console.log(data);
                        }

                    },
                    error: function(xhr, status, error) {
                        var msg = "erreur " + _api_url + " : " + error;
                        console.log(msg);
                    }
                });
            });

        });
    };

    var _appendReports = function () {

        var cards = [];
        var options = [];
        $("#reports .container").remove();
        Object.entries(_report_data).forEach(function(a) {
            var id = a[0];
            var data = a[1];
            cards.push(
            ['<div class="card dataviz" data-dataviz-id="'+id+'" style="width: 18rem;">',
              '<div class="card-body">',
                '<h5 class="card-title">'+data.title+'</h5>',
                '<a href="#" class="card-link" data-toggle="modal" data-report-state="edit" data-report-id="'+id+'" data-target="#report-modal-form">Editer</a>',
                '<a href="#" class="card-link" data-toggle="modal" data-report-state="delete" data-report-id="'+id+'" data-target="#report-modal-form">Supprimer</a>',
              '</div>',
            '</div>'].join("")
            );
            options.push('<option value="'+id+'">'+data.title+'</option>');
        });

        $("#reports").append('<div class="container"><div class="row">'+ cards.join("") + '</div></div>');
        $("#selectedReport").append(options.join(""));
    };

    var _showDataviz = function () {

        var cards = [];
        $("#catalog .container").remove();
        Object.entries(_dataviz_data).forEach(function(a) {
            var id = a[0];
            var data = a[1];
            cards.push(
            ['<div class="card dataviz" data-dataviz-id="'+id+'" style="width: 18rem;">',
              '<div class="card-body">',
                '<h5 class="card-title">'+data.title+'</h5>',
                '<h6 class="card-subtitle mb-2 text-muted"><span class="badge badge-info">'+data.level+'</span><span class="badge badge-warning">'+data.job+'</span></h6>',
                '<p class="card-text">'+data.description+'</p>',
                '<div class="custom-control custom-checkbox mb-3">',
                  '<input type="checkbox" id="'+id+'-selection" class="dataviz-selection custom-control-input" name="dataviz-selection">',
                  '<label class="custom-control-label" for="'+id+'-selection">Sélectionner</label>',
                '</div>',
                '<a href="#" class="card-link" data-toggle="modal" data-related-id="'+id+'" data-target="#dataviz-modal-form">Editer</a>',
                '<a href="#" class="card-link" data-toggle="modal" data-related-id="'+id+'" data-target="#dataviz-delete-modal-form">Supprimer</a>',
              '</div>',
            '</div>'].join("")
            );
        });

        $("#catalog").append('<div class="container"><div class="row">'+ cards.join("") + '</div></div>');
    };

    var _populateForm = function (formId, data) {
        for (let [key, value] of Object.entries(data)) {
            $(formId + ' .form-control[name="'+key+'"]').val(value);
        }
    };

	var _initCatalog = function () {
        $.ajax({
            dataType: "json",
            url: [_api_url, "store"].join("/"),
            success: function(data) {
                _dataviz_data = _arr2dic(data.datavizs, "dataviz");
               _showDataviz();
            },
            error: function(xhr, status, error) {
                var msg = "erreur " + _api_url + " : " + error;
                console.log(msg);
            }
        });
        $('#dataviz-modal-form').on('show.bs.modal', function(e) {
            var datavizId = $(e.relatedTarget).attr('data-related-id');
            $(e.currentTarget).attr("data-related-id", datavizId);
            $(e.currentTarget).find(".modal-title").text(datavizId);
            _populateForm('#dataviz-form',_dataviz_data[datavizId]);
        });

        $("#dataviz-modal-form .form-save").click(function(e) {
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
                contentType:"application/json",
                url: [_api_url, "store", id].join("/"),
                type: "POST",
                data: JSON.stringify(b),
                success: function(data) {
                    if (data.response === "success") {
                        //update local data
                        var dvz = _dataviz_data[data.dataviz];
                        $.extend( dvz, data.data );
                        _showDataviz();
                        $('#dataviz-modal-form').modal('hide');
                    } else {
                        console.log(data);
                    }
                },
                error: function(xhr, status, error) {
                    var msg = "erreur " + _api_url + " : " + error;
                    console.log(msg);
                }
            });


        });
    };

    _addDatavizToReport = function (report_id, report_data) {
        $.ajax({
            dataType: "json",
            contentType:"application/json",
            type: "PUT",
            data:JSON.stringify(report_data),
            url: [_api_url, "report_composition", report_id].join("/"),
            success: function(data) {
                if (data.response === "success") {
                    //update local data
                    console.log(data.report_composition);


                } else {
                    console.log(data);
                }
            },
            error: function(xhr, status, error) {
                var msg = "erreur " + _config.data_url + " : " + error;
                console.log(msg);
            }
        });
    };

    _addReport = function () {
        var report_name = $("#reportInputTitre").val();
        var report_id = report_name.replace(/[^\w\s]/gi, '').toLowerCase().replace(/ /g, "");
        //Create Report in db
        $.ajax({
            dataType: "json",
            contentType:"application/json",
            type: "PUT",
            data:JSON.stringify({"title": report_name}),
            url: [_api_url, "report", report_id].join("/"),
            success: function(data) {
                if (data.response === "success") {
                    //update local data
                    console.log(data.report);
                    //add dataviz to report
                    var datavizs = [];
                    $(".reports-dataviz .list-group-item").each(function(id, dvz) {
                        datavizs.push({"dataviz": $(dvz).attr("data-dataviz")});
                    });
                    _addDatavizToReport(data.report, datavizs);

                } else {
                    console.log(data);
                }
            },
            error: function(xhr, status, error) {
                var msg = "erreur " + _config.data_url + " : " + error;
                console.log(msg);
            }
        });

    };
    _deleteReport = function () {
        var report_name = $("#reportInputTitre").val();
        var report_id = report_name.replace(/[^\w\s]/gi, '').toLowerCase().replace(/ /g, "");
        //Delete Report in db
        Swal.fire({
            title: 'Voulez vous supprimer le rapport \''+report_name+'\' ?',
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
                    contentType:"application/json",
                    type: "DELETE",
                    url: [_api_url, "report", report_id].join("/"),
                    success: function(data) {
                        Swal.fire(
                            'Supprimé',
                            'Le raport \''+report_name+'\' a été supprimé',
                            'success'
                        )
                    },
                    error: function(xhr, status, error) {
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
        var dataviz_title = $("#reportInputTitre").val();
        var report_id = dataviz_title.replace(/[^\w\s]/gi, '').toLowerCase().replace(/ /g, "");
        //Delete Report in db
        Swal.fire({
            title: 'Voulez vous supprimer la dataviz \''+dataviz_title+'\' ?',
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
                    contentType:"application/json",
                    type: "DELETE",
                    url: [_api_url, "report", report_id].join("/"),
                    success: function(data) {
                        Swal.fire(
                            'Supprimé',
                            'Le raport \''+dataviz_title+'\' a été supprimé',
                            'success'
                        )
                    },
                    error: function(xhr, status, error) {
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

/*
     * Public
     */

    return {
        initCatalog: _initCatalog,
        initReports: _initReports,
        addReport: _addReport,
        deleteReport: _deleteReport,
        deleteDataviz: _deleteDataviz
    }; // fin return

})();

$(document).ready(function() {
    admin.initCatalog();
    admin.initReports();
});