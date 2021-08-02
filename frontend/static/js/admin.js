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

    var _initMenu = function () {
        $("ul.navbar-nav li").each(function () {
            $(this).on("click", function () {
                $(".container-fluid.page, .nav-item").removeClass("active");
                $("#" + $(this).attr("data-page")).addClass("active");
                if($(this).attr("data-page")=="home"){
                  $("#home-page").addClass("active");
                };
                $(this).addClass("active");
                if($(this).attr("data-page") == "reports" && $("#cd-cart").hasClass("speed-in") ||
                  $(this).attr("data-page") =="composer" && $("#cd-cart").hasClass("speed-in") ||
                  $(this).attr("data-page") =="home" && $("#cd-cart").hasClass("speed-in")){
                    $("#cd-cart").toggleClass("speed-in");
                    $( "#catalog-content" ).css('margin-right','0');
                    $( "#catalog-content" ).css('transition','margin-right .6s');
                };
                if($(this).attr("data-page") == "reports" && $("#advancedFilterCatalogOptions").hasClass("speed-in") ||                
                  $(this).attr("data-page") =="home" && $("#advancedFilterCatalogOptions").hasClass("speed-in") ||
                   $(this).attr("data-page") =="composer" && $("#advancedFilterCatalogOptions").hasClass("speed-in")
                  ){
                    $("#advancedFilterCatalogOptions").toggleClass("speed-in");
                    $( "#catalog-content" ).css('margin-right','0');
                    $( "#catalog-content" ).css('transition','margin-right .6s');
                    $('#filterLevelCatalog').val("0");
                };
                if($(this).attr("data-page") == "reports" ||
                  $(this).attr("data-page") =="composer" ||
                  $(this).attr("data-page") =="home" ){
                    $(".dataviz-selection").prop('checked', false).trigger("change");
                    $("#checkAll").prop('checked', false);
                    $("#searchbar").val("").trigger("keyup");
                };
                if($(this).attr("data-page") == "catalog" && $("#version-list").hasClass("speed-in") ||
                  $(this).attr("data-page") =="composer" && $("#version-list").hasClass("speed-in")||
                  $(this).attr("data-page") =="home" && $("#version-list").hasClass("speed-in")){
                    $("#version-list").toggleClass("speed-in");
                    $( "#reports-content" ).css('margin-right','0');
                    $( "#reports-content" ).css('transition','margin-right .6s');
                };
                if($(this).attr("data-page") == "catalog" && $("#report-select-options").hasClass("speed-in") ||
                  $(this).attr("data-page") =="composer" && $("#report-select-options").hasClass("speed-in")||
                  $(this).attr("data-page") =="home" && $("#report-select-options").hasClass("speed-in")){
                    $("#report-select-options").toggleClass("speed-in");
                    $( "#reports-content" ).css('margin-right','0');
                    $( "#reports-content" ).css('transition','margin-right .6s');
                };
                if($(this).attr("data-page") == "catalog"||
                  $(this).attr("data-page") =="composer"||
                  $(this).attr("data-page") =="home" ){
                    $(".rapport-selection").prop('checked', false).trigger("change");
                    $("#checkAllReports").prop('checked', false).trigger("change");
                    $("#searchbarReports").val("").trigger("keyup");
                    $('ul.report-options-items').empty();
                    $("#report-option-button .number").html($(".report-options-items li").length);
                };
            });
        });
    };

    var _setDatavizUsed = function (reports) {
        if (document.querySelectorAll("#dataviz-cards .dataviz").length > 0 &&
            document.querySelectorAll("#dataviz-cards .dataviz.used").length === 0) {
            for (const [key, report] of Object.entries(reports)) {
                if (report && report.dataviz && report.dataviz.length > 0) {
                    report.dataviz.forEach(function(dataviz) {
                        let element = document.querySelector("#dataviz-cards .dataviz[data-dataviz-id='"+dataviz.id+"']");
                        if (element && element.classList) {
                            element.classList.add("used");
                            let span = document.createElement("SPAN");
                            span.className = "badge mreport-primary-color-3-bg";
                            span.textContent = report.title;
                            element.querySelector(".card-footer").append(span);
                        }
                    })
                }
            }
        }
    }

    var _initReports = function () {
        $.ajax({
            dataType: "json",
            url: [report.getAppConfiguration().api, "report"].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    _report_data = _arr2dic(data.reports, "report");
                    _appendReports(data);
                    _setDatavizUsed(_report_data);

                } else {
                    var err = data.error || data.response;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        'Le catalogue n\'a pas pu être chargé <br> (' + err + ')',
                        'error'
                    );
                }

            },
            error: function (xhr, status, error) {
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite',
                    'L\'API ne réponds pas <br> (' + err + ')',
                    'error'
                );
            }
        });
        $('#report-modal-form').on('show.bs.modal', function (e) {
            $(".reports-dataviz .list-group-item").remove();
            var titre = $("#report-form .form-group label");
            var lst = [];
            var newReport = $(e.relatedTarget).attr('data-report-state');
            $(e.currentTarget).attr("data-report-state", newReport);
            var title = $(e.currentTarget).find('input[name="title"]');
            var description = $(e.currentTarget).find('input[name="description"]');
            var descriptionlabel = $(e.currentTarget).find('label[for="reportInputDescription"]');
            var confirmed = $("#report_confirmed");
            titre.find("b").remove();

            if (newReport === "edit") {
                // get data-id attribute of the clicked element
                var reportId = $(e.relatedTarget).data('report-id');
                var titre = $("#report-form .form-group label");
                titre.html(titre.html() + " <b>" + reportId + "</b>")
                confirmed.attr("data-report-id", reportId)
                var data = _report_data[reportId];
                // populate data
                title.val(data.title);
                description.prop("disabled", false);
                description.prop("hidden", false);
                description.val(data.description);
                title.prop("disabled", false);
                // data.dataviz = ['epci_title', 'epci_pop'];
                data.dataviz.forEach(function (dvz) {
                    if (dvz != null)
                        lst.push('<li data-dataviz="' + dvz.id + '" data-report="' + reportId + '" class="list-group-item item2keep"><span>' + dvz.title + '</span><button type="button" class="btn btn-delete mreport-error-color-bg">Delete</button></li>');
                });
                confirmed.attr("onclick", "admin.updateReport();");
                confirmed.html("Enregistrer");
            } else if (newReport === "new") {
                title.prop("disabled", false);
                description.prop("disabled", true);
                description.prop("hidden", true);
                descriptionlabel.prop("hidden",true);
                $("input.dataviz-selection:checked").each(function (id, dvz) {
                    var card = $(dvz).closest(".card.dataviz");
                    var id  = card.attr("data-dataviz-id");
                    var title = card.find(".card-title").text();
                    lst.push('<li data-dataviz="' + id + '" class="list-group-item">' + title + '</li>');
                });
                confirmed.attr("onclick", "admin.addReport();");
                confirmed.attr("data-report-id", reportId)
                confirmed.html("Enregistrer");
            } else {
                var reportId = $(e.relatedTarget).data('report-id');
                var data = _report_data[reportId];
                title.val(data.title);
                title.prop("disabled", true);
                description.prop("disabled", false);
                description.prop("hidden", false);
                data.dataviz.forEach(function (dvz) {
                  if (dvz != null)
                        lst.push('<li data-dataviz="' + dvz.id + '" data-report="' + reportId + '" class="list-group-item">' + dvz.title+ '</li>');
                  });
                confirmed.attr("onclick", "admin.deleteReport();");
                confirmed.attr("data-report-id", reportId)
                confirmed.html("Supprimer");
            }
            $(".reports-dataviz").append(lst.join(""));

            $(".reports-dataviz .btn-delete").click(function (e) {
                var item = $(this).parent();
                item.toggleClass("item2keep");
                if (item.hasClass("item2keep")) {
                    $(this).text("Delete")
                    $(this).removeClass("mreport-validate-color-bg");
                    $(this).addClass("mreport-error-color-bg");
                } else {
                    $(this).text("Keep");
                    $(this).removeClass("mreport-error-color-bg");
                    $(this).addClass("mreport-validate-color-bg");
                }
            });
        });
        $('#report-modal-form2').on('show.bs.modal', function (e) {
            var newReport = $(e.relatedTarget).attr('data-report-state');
            e.currentTarget.dataset.reportState = newReport;
            $(".reports-dataviz-exist .list-group-item").remove();
            var lst = []
            $("input.dataviz-selection:checked").each(function (id, dvz) {
                var card = $(dvz).closest(".card.dataviz");
                var id  = card.attr("data-dataviz-id");
                var title = card.find(".card-title").text();
                lst.push('<li data-dataviz="' + id + '" class="list-group-item">' + title + '</li>');
            });
            $(".reports-dataviz-exist").append(lst.join(""));
        });

        $('#report-modal-delete').on('show.bs.modal', function (e) {
          console.log("log");
          $("#reports-modal-delete-multiple .list-group-item").remove();
          var confirmed = $("#confirm_delete_reports");
          var lst = Array.from($('#report-select-options .report-options-items li'));
          confirmed.attr("onclick", "admin.deleteReports();");

          lst.forEach(function(element){
            var report_name = element.children[0].innerText;
            var report_id = element.dataset.reportId;
            $("#reports-modal-delete-multiple").append('<li data-report="' + report_id + '" class="list-group-item">' + report_name + '</li>');

          });

        });

    };

    var _initReportOptions = function(){
        //toggle report select options
        $('#report-option-button button').click(function (event) {
          event.stopPropagation();
          console.log('message');

          $("#report-select-options").toggleClass("speed-in");
          if($("#report-select-options").hasClass("speed-in") == false){
            $("#reports-content" ).css('margin-right','0');
            $("#reports-content" ).css('transition','margin-right .6s');
          }else{
            $( "#reports-content" ).css('margin-right','360px');
            $( "#reports-content" ).css('transition','margin-right .6s');
          }
          if($('#version-list').hasClass("speed-in") == true){
            $("#version-list").toggleClass("speed-in");
          }

        });

        /* Toggle report-select-options to disappear */
        $("#toggle-report-select-option").click(function (event) {
            $("#searchbarReports").val("").trigger("keyup");
            $("#report-select-options").toggleClass("speed-in");
            $( "#reports-content" ).css('margin-right','0');
            $( "#reports-content" ).css('transition','margin-right .6s');
        });

         $("#sortReportByName").click(function () {
          if($("#sortReportByName i").hasClass("fa-sort-alpha-down")){
            $("#sortReportByName i").removeClass("fa-sort-alpha-down");
            $("#sortReportByName i").addClass("fa-sort-alpha-up");

            $('#report-cards .cards').sort(function(a,b) {
              var c = $(a).find(".card-title").text().toLowerCase();
              var d = $(b).find(".card-title").text().toLowerCase();
              return new Intl.Collator('fr', { caseFirst: 'upper' } ).compare(c,d);
            }).appendTo("#report-cards");
          }else{
            $("#sortReportByName i").removeClass("fa-sort-alpha-up");
            $("#sortReportByName i").addClass("fa-sort-alpha-down");

            $('#report-cards .cards').sort(function(a,b) {
              var c = $(a).find(".card-title").text().toLowerCase();
              var d = $(b).find(".card-title").text().toLowerCase();
              return new Intl.Collator('fr', { caseFirst: 'upper' } ).compare(d,c);
            }).appendTo("#report-cards");

          }
        });

      $('#reportTri').click(function(){
        $('#stickyReportTri').toggle();
      });

    }

    var _appendReports = function (data) {
        var dataReport = data.reports;
        var cards = [];
        var options = ['<option value="" selected disabled>Rapport...</option>'];
        $("#reports .row").remove();
        var objArray = [];
        for (var prop in _report_data) {
            if (Object.prototype.hasOwnProperty.call(_report_data, prop)) {
                objArray.push(_report_data[prop]);
            }
        }
        objArray.sort(function (a, b) {
            return a.title.localeCompare(b.title);
        });
        objArray.forEach(function (elem) {
            cards.push(
                ['<div class="col-md-3 col-sm-12 cards">',
                    '<div class="card report" data-report-id="' + elem.report + '">',
                    '<div class="card-body ">',
                    '<h6 class="card-title col-12 text-center">' + elem.title + '</h6>',
                    '<p class="card-text">' + elem.description + '</p>',
                    '<div class="custom-control custom-checkbox mb-3">',
                    '<input type="checkbox" id="' + elem.report + '-selection" class="rapport-selection custom-control-input" name="rapport-selection">',
                    '<label class="custom-control-label" for="' + elem.report + '-selection">Sélectionner</label>',
                    '</div> ',
                    '<a href="' + report.getAppConfiguration().location + '/' + elem.report + '" target="_blank" class="card-link mreport-primary-color-1 d-block mx-0 pb-2"><i class="fas fa-eye mreport-secondary-color-1"></i> Afficher</a>',
                    '<a href="#" class="card-link mreport-primary-color-1 d-block mx-0 pb-2" data-toggle="modal" data-report-state="edit" data-report-id="' + elem.report + '" data-target="#report-modal-form"><i class="fas fa-pencil-alt mreport-secondary-color-1"></i> Editer</a>',
                    '<a href="#" onclick="composer.compose(\'' + elem.report + '\',null)" class="card-link mreport-primary-color-1  d-block mx-0 pb-2"><i class="fas fa-edit mreport-secondary-color-1"></i> Composer</a>',                    
                    '<a href="#" class="card-link mreport-primary-color-1 d-block mx-0 pb-2" data-toggle="modal" data-report-state="delete" data-report-id="' + elem.report + '" data-target="#report-modal-form"><i class="fas fa-trash mreport-secondary-color-1"></i> Supprimer</a>',
                    '<span class="card-link mreport-grey5 d-block mx-0 pb-2"><i class="fas fa-history mreport-grey5"></i> Versions</span>',
                    // Enabled for future versions functionnality
                    //'<a href="#" class="card-link mreport-primary-color-1 d-block mx-0 pb-2 displayVersions " data-report-id="' + elem.report + '"><i class="fas fa-history mreport-secondary-color-1"></i> Versions</a>',
                    '<a class="duplicate card-link mreport-primary-color-1 d-block mx-0 pb-2"><i class="fa fa-clone mreport-secondary-color-1" aria-hidden="true"></i> Copier</a>',
                    '</div>',
                    '</div>',
                    '</div>'
                ].join("")
            );
            options.push('<option value="' + elem.report + '">' + elem.title + '</option>');
        });


        $("#reports-content").append('<div class="row" id="report-cards">' + cards.join("") + '</div>');

        $("#selectedReport, #selectedReportComposer").html(options.join(""));
        $('.duplicate').on('click', _duplicateReport);
        $('.displayVersions').on('click', _displayVersions);

       
        // Reset inputs and report-select-options 
        $("#resetReportfilters").click(function () {
            // console.log("reset");
            $("#report-cards .cards:not(.hidden) .rapport-selection").prop('checked', false);
            $("#checkAllReports").prop('checked', false).trigger("change");;
            $("#searchbarReports").val("").trigger("keyup");
            $('ul.report-options-items').empty();
            $("#report-option-button .number").html($(".report-options-items li").length);
        });

        // Add event to all checkbox to add them into the cart
        $('#report-cards input[type="checkbox"]').change(function () {
            var id = $(this).parent().parent().parent().data().reportId;
            // console.log(id);
            
            if ($(this).is(":checked")) {
            // console.log($(this).parent().parent().find("h6")[0].outerHTML);
                $("#report-select-options .report-options-items").append(
                    "<li data-report-id=" + id + ">\
                         " + $(this).parent().parent().find("h6")[0].outerHTML + "\
                        <a href='#' class='cd-item-remove cd-img-replace'>Remove</a>\
                    </li>"
                );
              /*deactivate button if no selection*/
              if($("ul.report-options-items li").length < 1 ){
                $('.report-toggle-deactivate').prop('disabled', true);
              }else if($("ul.report-options-items li").length >= 1 ){
                $('.report-toggle-deactivate').prop('disabled', false);
              }
            } else {
                $("#report-select-options .report-options-items li[data-report-id|=" + id + "]").remove();
              /*deactivate button if no selection*/
              if($("ul.report-options-items li").length < 1 ){
                $('.report-toggle-deactivate').prop('disabled', true);
              }else if($("ul.report-options-items li").length >= 1 ){
                $('.report-toggle-deactivate').prop('disabled', false);
              }
            }
            $("#report-option-button .number").html($(".report-options-items li").length);
        });

        // deactivate button if no selection
        if($("ul.report-options-items li").length < 1 ){
          $('.report-toggle-deactivate').prop('disabled', true);
        }else if($("ul.report-options-items li").length >= 1 ){
          $('.report-toggle-deactivate').prop('disabled', false);
        }

        // Remove event from the 'select all' checkbox because we do not want to add it to the cart 
        $("#checkAllReports").off("change");

        // Bind event to dynamically generated cart items in order to delete them from the cart and unselect them in the list
        $(document).on('click', "#report-select-options .report-options-items li .cd-item-remove", function () {
            var id = $(this).parent().data().reportId;
            $("#report-cards div[data-report-id|=" + id + "] input[type='checkbox']").prop('checked', false);
            $(this).parent().remove();
            $("#report-option-button .number").html($(".report-options-items li").length);

        });

        // Select all visible items in the list and trigger the change event on checkbox to add them in the cart
        $("#checkAllReports").click(function () {
            var rpt = $("#reports-content .cards:not(.hidden) .rapport-selection");
            var checked = $(this).prop('checked');
            rpt.each(function () {
                if (!$(this).prop('checked') == checked) {
                    $(this).prop('checked', checked).trigger('change');
                } else {
                    $(this).prop('checked', checked);
                }
            });
            $("#report-option-button .number").html($(".report-options-items li").length);
        });

        // Search for report in Rapports page
        var options = {
          tokenize: false,
          threshold: 0.3,
          distance: 500,
          findAllMatches:true,
          minMatchCharLength: 2,
          keys: [
            "title",
            "report",
            "description"
          ]
        };
        var fuse = new Fuse(dataReport, options);

        $("#searchbarReports").on("keyup", function () {
          $("#checkAllReports").prop('checked', false);
          var result = fuse.search($(this).val());
          var divs = $(".card.report");
          if ($(this).val() != "") {
            divs.parent().addClass("hidden");
            result.forEach(function (elem) {
              divs.each(function () {
                if (elem.report == $(this).attr("data-report-id")) {
                  $(this).parent().removeClass("hidden");
                }
              });
            });
          } else {
            divs.parent().removeClass("hidden");
          }
        });

    };

    var _showDataviz = function () {
        document.querySelectorAll("#dataviz-cards .cards").forEach(e => e.parentNode.removeChild(e));
        let container = document.getElementById("dataviz-cards");
        let template = container.querySelector("template").innerHTML.trim();
        var cards = { cards: [] };
        Object.entries(_dataviz_data).forEach(function (a) {
            var id = a[0];
            var data = a[1];
            var designedDataviz = (data.viz.length > 0)? 'enabled':'disabled';
            var certifiedDataviz = 'disabled';
            if (data.description && data.description.includes("[certified]")) {
                certifiedDataviz = 'enabled';
            }

            let card = {
                id: id,
                title: data.title,
                level: data.level,
                job: data.job,
                description: data.description,
                designed: designedDataviz,
                certified: certifiedDataviz
            };
            cards.cards.push(card);

        });
        let render = Mustache.render(template, cards);
       $(container).append(render);
       _setDatavizUsed(_report_data);
        /* Add event to all checkbox to add them into the cart */
        $('#dataviz-cards input[type="checkbox"]').change(function () {
            var id = $(this).parent().parent().parent().data().datavizId;
            if ($(this).is(":checked")) {
                $("#cd-cart .cd-cart-items").append(
                    "<li data-dataviz-id=" + id + ">\
                        " + $(this).parent().parent().find("h6")[0].outerHTML + "\
                        " + $(this).parent().parent().find("h7")[0].outerHTML + "\
                        <a href='#' class='cd-item-remove cd-img-replace'>Remove</a>\
                    </li>"
                );
              /*deactivate button if no selection*/
              if($("ul.cd-cart-items li").length < 1 ){
                $('.toggle-deactivate').prop('disabled', true);
              }else if($("ul.cd-cart-items li").length >= 1 ){
                $('.toggle-deactivate').prop('disabled', false);
              }
            } else {
                $("#cd-cart .cd-cart-items li[data-dataviz-id|=" + id + "]").remove();
              /*deactivate button if no selection*/
              if($("ul.cd-cart-items li").length < 1 ){
                $('.toggle-deactivate').prop('disabled', true);
              }else if($("ul.cd-cart-items li").length >= 1 ){
                $('.toggle-deactivate').prop('disabled', false);
              }
            }
            $(".green .number").html($(".cd-cart-items li").length);
        });
        /*deactivate button if no selection*/
        if($("ul.cd-cart-items li").length < 1 ){
          $('.toggle-deactivate').prop('disabled', true);
        }else if($("ul.cd-cart-items li").length >= 1 ){
          $('.toggle-deactivate').prop('disabled', false);
        }
        /* Remove event from the 'select all' checkbox because we do not want to add it to the cart */
        $("#checkAll").off("change");
        /* Bind event to dynamically generated cart items in order to delete them from the cart and unselect
        them in the list */
        $(document).on('click', "#cd-cart .cd-cart-items li .cd-item-remove", function () {
            var id = $(this).parent().data().datavizId;
            $("#dataviz-cards div[data-dataviz-id|=" + id + "] input[type='checkbox']").prop('checked', false);
            $(this).parent().remove();
            $(".green .number").html($(".cd-cart-items li").length);

        });
    };

    var _populateForm = function (formId, data) {
        for (let [key, value] of Object.entries(data)) {
            $(formId + ' .form-control[name="' + key + '"]').val(value);
        }
    };

    var _initLevels = function () {
         //get levels list
        $.ajax({
            dataType: "json",
            url: [report.getAppConfiguration().api, "level"].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    _levels = data.levels;
                    let options = [];
                    data.levels.forEach(function (level) {
                        options.push(`<option value="${level}">${level}</option>`);
                    })
                    $("#dataviz-modal-form #inputLevel,#dataviz-form2 #inputLevel").append(options.join(""));


                } else {
                    var err = data.error || data.response;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        'La liste des référentiels n\'a pas pu être chargée <br> (' + err + ')',
                        'error'
                    );
                }
            },
            error: function (xhr, status, error) {
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite',
                    'L\'API ne réponds pas <br> (' + err + ')',
                    'error'
                );
            }
        });

    };
    var _initCatalog = function () {
        $.ajax({
            dataType: "json",
            url: [report.getAppConfiguration().api, "store"].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    _dataviz_data = _arr2dic(data.datavizs, "dataviz");
                    _showDataviz();
                    var options = {
                        tokenize: false,
                        threshold: 0.1,
                        distance: 500,
                        minMatchCharLength: 2,
                        findAllMatches:true,
                        keys: [
                            "title",
                            "description",
                            "year",
                            "level",
                            "source",
                            "job"
                        ]
                    };
                    var optionsLevel = {
                      tokenize: false,
                      threshold: 0.0,
                      distance: 500,
                      minMatchCharLength: 2,
                      keys: [
                        "level",
                      ]
                    };
                    var fuse = new Fuse(data.datavizs, options);
                    var fuseLevels = new Fuse(data.datavizs, optionsLevel);
                    $("#searchbar").on("keyup", function () {
                      $("#filterSearchAdvancedCatalog").val("");
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
                    $("#filterSearchAdvancedCatalog").on("keyup", function () {
                      $("#searchbar").val("");
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

                    $('#filterLevelCatalog').on("change", function () {
                       $("#checkAll").prop('checked', false);
                        var result = fuseLevels.search($(this).val());
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
                } else {
                    var err = data.error || data.response;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        'Les rapports n\'ont pas pu être chargés <br> (' + err + ')',
                        'error'
                    );
                }

            },
            error: function (xhr, status, error) {
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite',
                    'L\'API ne réponds pas <br> (' + err + ')',
                    'error'
                );
            }
        });
    };

    _initCatalogOptions  = function () {
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
            $("#dataviz_configure").attr("data-related-id", datavizId);
            $(e.currentTarget).find(".dataviz-title").text(datavizId);
            //Remove existing visualization
            document.getElementById("xviz").innerHTML = '';
            _populateForm('#dataviz-form', _dataviz_data[datavizId]);
            if (visualization.value) {
                admin.visualizeDataviz();
            }
        });
        /* Select all visible items in the list and trigger the cahnge event on checkbox to add them in the cart */
        $("#checkAll").click(function () {
            var dvz = $("#dataviz-cards .cards:not(.hidden) .dataviz-selection");
            var checked = $(this).prop('checked');
            dvz.each(function () {
                if (!$(this).prop('checked') == checked) {
                    $(this).prop('checked', checked).trigger('change');
                } else {
                    $(this).prop('checked', checked);
                }
            });
        });
        /* Reset all inputs and cart */
        $("#resetfilters").click(function () {
            $(".dataviz-selection").prop('checked', false).trigger("change");
            $("#checkAll").prop('checked', false);
            $("#searchbar").val("").trigger("keyup");
        });
        $("#resetAdvancedCatalogfilters").click(function () {
            $("#filterSearchAdvancedCatalog").val("").trigger("keyup");
            $('#filterLevelCatalog').val("0");
$(".card.dataviz").parent().removeClass("hidden").removeClass("filterLevelCatalog");
        });

        /* Toggle the cart to appear */
        $(".green").click(function () {
            $("#cd-cart").toggleClass("speed-in");
            $( "#catalog-content" ).css('margin-right','360px');
            $( "#catalog-content" ).css('transition','margin-right .6s');
          if($("#cd-cart").hasClass("speed-in") == false){
            $("#catalog-content" ).css('margin-right','0');
            $("#catalog-content" ).css('transition','margin-right .6s');
          }
        });
        /* Toggle the cart to disappear */
        $("#togglePanier").click(function () {
            $("#cd-cart").toggleClass("speed-in");
            $( "#catalog-content" ).css('margin-right','0');
            $( "#catalog-content" ).css('transition','margin-right .6s');
        });
      $("#sortDatavizByName").click(function () {
        if($("#sortDatavizByName i").hasClass("fa-sort-alpha-down")){
          $("#sortDatavizByName i").removeClass("fa-sort-alpha-down");
          $("#sortDatavizByName i").addClass("fa-sort-alpha-up");
          $('#dataviz-cards .cards').sort(function(a,b) {
            var c = $(a).find(".card-title").text().toLowerCase();
            var d = $(b).find(".card-title").text().toLowerCase();
            return new Intl.Collator('fr', { caseFirst: 'upper' } ).compare(c,d);
          }).appendTo("#dataviz-cards");
        }else{
          $("#sortDatavizByName i").removeClass("fa-sort-alpha-up");
          $("#sortDatavizByName i").addClass("fa-sort-alpha-down");
          $('#dataviz-cards .cards').sort(function(a,b) {
            var c = $(a).find(".card-title").text().toLowerCase();
            var d = $(b).find(".card-title").text().toLowerCase();
            return new Intl.Collator('fr', { caseFirst: 'upper' } ).compare(d,c);
          }).appendTo("#dataviz-cards");
        }
      });

      $("#advancedFilterCatalog").click(function () {
        $("#cd-cart").toggleClass("speed-in");
        $("#advancedFilterCatalogOptions").toggleClass("speed-in");
      });

        /* Toggle the cart to disappear */
        $("#toggleAdvancedFilter").click(function () {
            $("#advancedFilterCatalogOptions").toggleClass("speed-in");
            $( "#catalog-content" ).css('margin-right','0');
            $( "#catalog-content" ).css('transition','margin-right .6s');
        });

      $("#returnToOptionsCatalog").click(function(){
        $("#advancedFilterCatalogOptions").toggleClass("speed-in");
        $("#cd-cart").toggleClass("speed-in");
      });   


      $.ajax({
            dataType: "json",
            url: [report.getAppConfiguration().api, "level"].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    _levels = data.levels;
                    let options = [];
                    data.levels.forEach(function (level) {
                        options.push(`<option value="${level}">${level}</option>`);
                    })
                    $("#filterLevelCatalog").append(options.join(""));


                } else {
                    var err = data.error || data.response;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        'La liste des référentiels n\'a pas pu être chargée <br> (' + err + ')',
                        'error'
                    );
                }
            },
            error: function (xhr, status, error) {
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite',
                    'L\'API ne réponds pas <br> (' + err + ')',
                    'error'
                );
            }
        });

      $('#catalogTri').click(function(){
        $('#stickyCatalogTri').toggle();
      });
      
    }

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
                    // console.log(data);
                    _initReports();

                } else {
                    $('#report-modal-form').modal('hide');
                    var err = data.error;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        err,
                        'error'
                    );
                }
            },
            error: function (xhr, status, error) {
                $('#report-modal-form').modal('hide');
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite',
                    err,
                    'error'
                );
            }
        });
    };

    _parseError = function (response) {
        var err = "";
        try {
            var json = JSON.parse(response);
            if (json.response) {
                err = json.response;
            }
        } catch (e) {
            err = "Parsing error:" + e;
        }
        return err;
    }

    _addReport = function () {
        var report_name = $("#reportInputTitre").val();
        var report_id = report_name.replace(/[^\w\s]/gi, '').toLowerCase().replace(/ /g, "");
        //Create Report in db
        $.ajax({
            dataType: "json",
            contentType: "application/json",
            type: "PUT",
            data: JSON.stringify({
                "title": report_name,
                "copy": false
            }),
            url: [report.getAppConfiguration().api, "report", report_id].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    //update local data
                    console.log(data.report);
                    //add dataviz to report

                    var datavizs = [];
                    $("#reports-dataviz-modal-event.reports-dataviz .list-group-item").each(function (id, dvz) {
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
                            $("#btn-composer").click();
                            $("#selectedReportComposer").val(report_id).change();
                        }
                    });

                } else {
                    $('#report-modal-form').modal('hide');
                    var err = data.error;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        err,
                        'error'
                    );
                }
            },
            error: function (xhr, status, error) {
                $('#report-modal-form').modal('hide');
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite avec la création du rapport.',
                    err,
                    'error'
                );
            }
        });

    };
    _createReport = function () {
        var report_id = $("#selectedReport").val();
        var report_name = $("#selectedReport option[value=" + report_id + "]").text();
        var datavizs = [];
        //var report_description = $("#reportInputDescription").val();
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
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite. La dataviz n\'a pu être ajouté',
                    err,
                    'error'
                )
            }
        });


    }
    _deleteDatavizFromReport = function (dataviz2delete, report_id, report_name) {
        var resultArray = dataviz2delete;
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
                    $('#report-modal-form').modal('hide');
                    var err = data.error;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        err,
                        'error'
                    );
                }
            },
            error: function (xhr, status, error) {
                $('#report-modal-form').modal('hide');
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite',
                    err,
                    'error'
                );
            }
        });
    }
    _updateReport = function () {
        var report_name = $("#reportInputTitre").val();
        var report_description = $("#reportInputDescription").val();
        var report_id = $("#report_confirmed").attr("data-report-id");
        var dataviz2delete = $(".reports-dataviz li:not(.item2keep)");
        var resultArray = [];
        dataviz2delete.each(function () {
            resultArray.push({
                "dataviz": $(this).data("dataviz")
            });
        });
        $.ajax({
            dataType: "json",
            contentType: "application/json",
            type: "POST",
            data: JSON.stringify({
                "title": report_name,
                "description": report_description
            }),
            url: [report.getAppConfiguration().api, "report", report_id].join("/"),
            success: function (data) {
                if (data.response === "success") {
                    //update local data
                    if (dataviz2delete.length > 0) {
                        _deleteDatavizFromReport(resultArray, report_id, report_name);
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
                    $('#report-modal-form').modal('hide');
                    var err = data.error;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        err,
                        'error'
                    );
                }
            },
            error: function (xhr, status, error) {
                $('#report-modal-form').modal('hide');
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite',
                    err,
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
            confirmButtonColor: '#B0252E',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Supprimer'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    dataType: "json",
                    contentType: "application/json",
                    type: "DELETE",
                    url: [report.getAppConfiguration().api, "report", report_id].join("/"),
                    success: function (data) {
                        if (data.response === "success") {
                            $('#report-modal-form').modal('hide');
                            Swal.fire(
                                'Supprimé',
                                'Le rapport \'' + report_name + '\' a été supprimé',
                                'success'
                            )
                        } else {
                            $('#report-modal-form').modal('hide');
                            var err = data.error || data.response;
                            Swal.fire(
                                'Une erreur s\'est produite',
                                err,
                                'error'
                            );
                        }
                    },
                    complete: function () {
                        _initReports();
                    },
                    error: function (xhr, status, error) {
                        $('#report-modal-form').modal('hide');
                        var err = _parseError(xhr.responseText);
                        Swal.fire(
                            'Une erreur s\'est produite',
                            err,
                            'error'
                        )
                    }
                });

            }
        })
    };

    _deleteReports = function () {
      var lst= Array.from($('#report-select-options .report-options-items li'));
      var titles = [];
      var deleted=[];
      var successDelete = false;

      lst.forEach(function(element){
        titles.push(element.children[0].innerText);
      });

      console.log(lst);
      console.log(titles);

        Swal.fire({
            title: 'Voulez vous supprimer les rapports \'' + titles.join() + '\' ?',
            text: "Vous ne pourrez pas revenir en arrière !",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmer'
        }).then((result) => {
            if (result.value) {
              lst.forEach(function(element){
                var report_name = element.children[0].innerText;
                var report_id = element.dataset.reportId;
                $.ajax({
                    dataType: "json",
                    contentType: "application/json",
                    type: "DELETE",
                    url: [report.getAppConfiguration().api, "report", report_id].join("/"),
                    success: function (data) {
                        if (data.response === "success") {
                          successDelete = true;
                          deleted.push(report_name);
                          // console.log('DELETED');
                          // console.log(deleted)

                        } else {
                            $('#report-modal-form').modal('hide');
                            var err = data.error || data.response;
                            Swal.fire(
                                'Une erreur s\'est produite',
                                err,
                                'error'
                            );
                        }
                    },
                    complete: function () {
                        _initReports();
                    },
                    error: function (xhr, status, error) {
                        $('#report-modal-form').modal('hide');
                        var err = _parseError(xhr.responseText);
                        Swal.fire(
                            'Une erreur s\'est produite',
                            err,
                            'error'
                        )
                    }
                });
              });
            }
          if(successDelete == true){ 
            Swal.fire(
            'Supprimé',
            'Les rapports \'' + deleted.join() + '\' ont été supprimé',
              'success'
            )
          }
        })
        $('#report-modal-delete').modal('hide');
        $("#report-cards .cards:not(.hidden) .rapport-selection").prop('checked', false);
        $("#checkAllReports").prop('checked', false);
        $("#searchbarReports").val("").trigger("keyup");
        $('ul.report-options-items').empty();
        $("#report-option-button .number").html($(".report-options-items li").length);
        // console.log(deleted)
      
    }

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
                        var err = _parseError(xhr.responseText);
                        Swal.fire(
                            'Une erreur s\'est produite',
                            err,
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
                    $('#report-modal-form').modal('hide');
                    var err = data.error;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        err,
                        'error'
                    );
                }
            },
            complete: function () {
                _initCatalog();
            },
            error: function (xhr, status, error) {
                $('#dataviz-modal-form').modal('hide');
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite',
                    err,
                    'error'
                )
            }
        });

    };

    var _getReportData = function (reportId) {
        return _report_data[reportId];
    };

    var _getDataviz = function (datavizid) {
        return _dataviz_data[datavizid];
    };

    var _visualizeDataviz = function () {
        var viz = JSON.parse(visualization.value);
        var dataviz = wizard.json2html(viz);
        let element = document.getElementById("xviz");
        element.innerHTML = '';
        element.appendChild(dataviz);
        report.testViz(viz.data, viz.type, viz.properties);
        //Hack to avoid many div with the same id
        dataviz.querySelector(".dataviz").id += ".tmp";
        if (dataviz.querySelector("canvas")) {
            dataviz.querySelector("canvas").id += ".tmp";
        }
    };

    /*
     * _saveDataviz. This method get dataviz definition in wizard and save it in viz dataiz field
     *
     */

    var _saveDataviz = function (definition) {
        var datavizId = definition.properties.id;
        //get dataviz definition
        var viz = JSON.stringify(definition);
        $.ajax({
            dataType: "json",
            type: "POST",
            contentType: 'application/json',
            url: [report.getAppConfiguration().api, "store", datavizId].join("/"),
            data: JSON.stringify({
                "viz": viz
            }),
            success: function (response) {
                if (response.response === "success" && response.data.viz) {
                    //Append local stored viz
                    admin.getDataviz(datavizId).viz = response.data.viz;
                    //Refresh dataviz in dataviz-modal-form
                    if (document.getElementById("dataviz-modal-form").classList.contains("show")) {
                        visualization.value = response.data.viz;
                        admin.visualizeDataviz();
                    }
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
    var _duplicateReport = function (event) {
        var parent = event.currentTarget.parentNode
        var report_title = parent.firstElementChild.innerHTML;
        console.log(report_title);
        Swal.fire({
            title: 'Voulez vous copier le rapport \'' + report_title + '\' ?',
            icon: 'question',
            showCancelButton: true,
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmer'
        }).then((result) => {
            if (result.value) {
                var reportDataset = event.currentTarget.parentNode.children[4].dataset;
                var reportId = reportDataset.reportId;
                var reportData = _report_data[reportId];
                var datavizs = [];
                reportData.dataviz.forEach(function (elem) {
                    datavizs.push({
                        "dataviz": elem.id
                    });
                });
                $.ajax({
                    dataType: "json",
                    contentType: "application/json",
                    type: "PUT",
                    data: JSON.stringify({
                        "title": report_title,
                        "copy": true
                    }),
                    url: [report.getAppConfiguration().api, "report", reportId].join("/"),
                    success: function (data) {
                        if (data.response === "success") {
                            //add dataviz to report
                            if (datavizs.length > 0) {
                                _addDatavizToReport(data.report, datavizs);
                            } else {
                                _initReports();
                            }
                            Swal.fire({
                                title: 'Copié',
                                text: "Le rapport \'" + report_title + "\' a été copié",
                                icon: 'success',
                                showCancelButton: false
                            });
                        } else {
                            $('#report-modal-form').modal('hide');
                            var err = data.error;
                            Swal.fire(
                                'Une erreur s\'est produite',
                                err,
                                'error'
                            );
                        }
                    },
                    error: function (xhr, status, error) {
                        $('#report-modal-form').modal('hide');
                        var err = _parseError(xhr.responseText);
                        Swal.fire(
                            'Une erreur s\'est produite',
                            err,
                            'error'
                        );
                    }
                });

            }
        })
    }

    var _displayVersions = function(event) {
      if($("#version-items").children.length >0){
        $("#version-items").empty();
      }
        /* Toggle the version list to appear */
            $("#version-list").addClass("speed-in");
            $("#report-select-options").removeClass("speed-in");
            $("#reports-content").css('margin-right','360px');
            $("#reports-content").css('transition','margin-right .6s');
          if($("#version-list").hasClass("speed-in") == false){
            $("#reports-content").css('margin-right','0');
            $("#reports-content").css('transition','margin-right .6s');
          }

        /* Toggle the versions list to disappear */
        $("#closeVersions").click(function () {
            $("#version-list").removeClass("speed-in");
            $("#reports-content").css('margin-right','0');
            $("#reports-content").css('transition','margin-right .6s');
        });
      

      var report_id = event.currentTarget.getAttribute('data-report-id');
      console.log("event="+event);
      console.log("report_id="+report_id);

      _initReportsVersion(report_id)
    }


    var _initReportsVersion = function (report_id) {
          $.ajax({
            dataType: "json",
            contentType: "application/json",
            type: "GET",
            url: [report.getAppConfiguration().api, "backup", report_id].join("/"),

            success: function (data) {
                if (data.response === "success") {
                    console.log(data);
                    console.log(data.report_backups.save_date);
                    let numberVersion =data.report_backups.length+1;
                    for(const item of data.report_backups){
                      numberVersion = numberVersion -1 ;
                      $("#version-items").append('<div class="row"><li class="versionList-item w-100" id=' + report_id + '"><h6 class="card-title">'+ numberVersion + '- '+ report_id + '</h6><p class="mreport-grey4">'+item.save_date+'</p><a href="#" class="card-link mreport-primary-color-1 d-block mx-0 pb-2" onclick="composer.compose(\'' + report_id + '\',\''+ item.id+'\')"><i class="fas fa-edit mreport-secondary-color-1"></i>Composer</a></li></div>');
                    }
                } else {
                    var err = data.error || data.response;
                    Swal.fire(
                        'Une erreur s\'est produite',
                        'Les versions du rapport n\'ont pas pu être chargé <br> (' + err + ')',
                        'error'
                    );
                }

            },
            error: function (xhr, status, error) {
                var err = _parseError(xhr.responseText);
                Swal.fire(
                    'Une erreur s\'est produite',
                    'L\'API ne réponds pas <br> (' + err + ')',
                    'error'
                );
            },
            complete: function () {
            
            },
        });
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
        deleteReports: _deleteReports,
        deleteDataviz: _deleteDataviz,
        updateDataviz: _updateDataviz,
        getDataviz: _getDataviz,
        createReport: _createReport,
        getReportData: _getReportData,
        visualizeDataviz: _visualizeDataviz,
        saveVisualization: _saveDataviz,
        initLevels: _initLevels,
        initReportsVersion: _initReportsVersion,
        initReportOptions: _initReportOptions,
        initCatalogOptions: _initCatalogOptions
    }; // fin return

})();

$(document).ready(function () {
    admin.initCatalog();
    admin.initReports();
    admin.initMenu();
    admin.initLevels();
    admin.initReportOptions();
    admin.initCatalogOptions();
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});