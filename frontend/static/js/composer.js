composer = (function () {
    /*
     * Private
     */


    /*
     * _HTMLTemplates - {object}. This var store structured html blocks issued
     * from html template selected
     */

    var _HTMLTemplates = {};

    /*
     * _activeHTMLTemplate - string. This var store template selected id
     */

    var _activeHTMLTemplate = "";

    /*
     * _blockTemplate - Array. This var is used to construct bloc elements and append it
     * to dom with selected HTMLTemplate
     */

    var _blockTemplate = [
        '<div class="structure-bloc list-group-item">',
        '<span class="remove badge badge-danger">',
        '<i class="fas fa-times"></i> remove',
        '</span>',
        '<span class="structure-description">',
        '{{{DESCRIPTION}}}',
        '</span>',
        '<span class="drag badge badge-default">',
        '<i class="fas fa-arrows-alt"></i> drag',
        '</span>',
        '<div class="structure-html">{{{HTML}}}</div>',
        '</div>'
    ].join("");

    var _dynamicBootstrapBloc = [
        '<div class="structure-bloc list-group-item disable_dynamic">',
        '<span class="remove badge badge-danger">',
        '<i class="fas fa-times"></i> remove',
        '</span>',
        '<span class="structure-description">',
        '<input id="bootstrap_columns" type="text" class="form-control" placeholder="Ex : 6 6">',
        '<p id="nb_columns" class="d-none"></p>',
        '</span>',
        '<span class="drag badge badge-default">',
        '<i class="fas fa-arrows-alt"></i> drag',
        '</span>',
        '<div class="structure-html">',
        '<div class="row bloc-content">',
        '</div>',
        '</div>',
        '</div>'
    ].join("");

    /*
     * _extraElementTemplate - Array. This var is used to construct extra elements and append it
     * to dom with selected HTMLTemplate
     */

    var _extraElementTemplate = [
        '<div class="structure-element list-group-item">',
        '<span><i class="{{{ICON}}}"></i></span>',
        '<span class="structure-element-description">',
        '{{{DESCRIPTION}}}',
        '</span>',
        '<div class="structure-element-html">{{{HTML}}}</div>',
        '<div class="tool">',
        '<button class="btn btn-default" data-toggle="modal" data-related-id="{{dvz}}" data-target="#wizard-panel">',
        '<i class="fas fa-cog"></i>',
        '</button>',
        '</div>',
        '</div>'
    ].join("");

    /*
     * _datavizTemplate - Array. This var is used to construct dataviz items and append them to dom
     * in #dataviz-items list
     */

    var _datavizTemplate = [
        '<li data-dataviz="{{dvz}}" title="{{dvz}}" data-report="{{reportId}}" class="dataviz list-group-item">',
        '<div class="tool">',
        '<button class="btn btn-default" data-toggle="modal" data-related-id="{{dvz}}" data-target="#wizard-panel">',
        '<i class="fas fa-cog"></i>',
        '</button>',
        '</div>',
        '<span>{{dvz}}</span>',
        '<code class="dataviz-definition"></code>',
        '</li>'
    ];

    var _selectedCustomColumn = false;
    /*
     * _selectTemplate. This method is used to update structure, style  and icons store derived
     * from selected template
     * method linked to #selectedModelComposer change event
     */

    var _selectTemplate = function (e) {
        var m = $(this).val();
        _activeHTMLTemplate = m;
        //Update structure elements choice in composer page
        $("#structure-models .list-group-item").remove();
        $("#structure-models").append(_HTMLTemplates[m].elements);
        $("#element-models .list-group-item").remove();
        $("#element-models").append(_HTMLTemplates[m].extra_elements);
        //update style in wizard modal
        $("#wizard-result style").remove();
        $("#wizard-result").append(_HTMLTemplates[m].style);
        //update icon store in wizard modal
        $("#w_icon option").remove();
        if (_HTMLTemplates[m].parameters.icons) {
            var icon_options = [];
            var icons = _HTMLTemplates[m].parameters.icons.split(",");
            icons.forEach(function (i) {
                icon_options.push('<option value="' + i + '">' + i + '</option>');
            });
            $("#w_icon").append(icon_options.join(""));
        }


    }

    /*
     * _parseTemplate. This method is used to parse html template
     * and update composer IHM and _HTMLTemplates var with result
     */

    var _parseTemplate = function (templateid, html) {
        // get data- linked to the template
        var parameters = $(html).data(); /* eg data-icons, data-colors... */
        if (parameters.colors) {
            parameters.colors = parameters.colors.split(",");
        }
        //get style
        var style = $(html).find("style")[0];
        if (style) {
            style = style.outerHTML;
        }
        //get main template div
        var page = $(html).find("template.report").get(0).content.firstElementChild.outerHTML;
        var blocs = [];
        //get all report-bloc and report-bloc-title
        $(html).find("template.report-bloc, template.report-bloc-title").each(function (id, template) {
            var elem = $(template).prop('content').firstElementChild;
            var description = elem.getAttribute("data-model-title");
            blocs.push({
                "html": elem.outerHTML,
                "description": description
            });
        });
        //Store all blocs in structure - Array
        var structure = [];
        blocs.forEach(function (elem) {
            structure.push(_blockTemplate.replace("{{{HTML}}}", elem.html).replace("{{{DESCRIPTION}}}", elem.description));
        });
        structure.push(_dynamicBootstrapBloc);
        //Retrieve all dataviz components
        var dataviz_components = {};
        ["figure", "chart", "table", "title", "text", "iframe", "image", "map"].forEach(function (component) {
            var element = $(html).find("template.report-component.report-" + component).prop('content').firstElementChild;
            dataviz_components[component] = $.trim(element.outerHTML);
        });
        var x_elements = [];
        //get all report-element
        $(html).find("template.report-element").each(function (id, template) {
            var elem = $(template).prop('content').firstElementChild;
            var description = elem.getAttribute("data-model-title");
            var icon = elem.getAttribute("data-model-icon");
            x_elements.push({
                "html": elem.outerHTML,
                "description": description,
                "icon": icon
            });
        });
        //Store all elements in structure - Array
        var extra_elements = [];
        x_elements.forEach(function (elem) {
            extra_elements.push(_extraElementTemplate.replace("{{{HTML}}}", elem.html)
                .replace("{{{DESCRIPTION}}}", elem.description)
                .replace("{{{ICON}}}", elem.icon)
            );
        });
        //Populate _HTMLTemplates with object
        _HTMLTemplates[templateid] = {
            parameters: parameters,
            style: style,
            page: page,
            elements: structure,
            extra_elements: extra_elements,
            dataviz_components: dataviz_components
        };
        $("#selectedModelComposer").append('<option value="' + templateid + '">' + templateid + '</option>');

    };

    /*
     * _initComposer. This method initializes composer by loading html templates.
     */

    var _initComposer = function () {
        //TODO use config file to load html templates instead of ["a","b"]
        ["a", "b"].forEach(function (m) {
            $.ajax({
                url: "/static/html/model-" + m + ".html",
                dataType: "text",
                success: function (html) {
                    //Template parsing
                    _parseTemplate(m, html);

                },
                error: function (xhr, status, err) {
                    _alert("Erreur avec le fichier html/model-" + m + ".html " + err, "danger", true);
                }
            });
        });

        // configure #report-composition to accept drag & drop from structure elements
        new Sortable(document.getElementById("report-composition"), {
            handle: '.drag', // handle's class
            group: 'structure',
            animation: 150,
            onAdd: function ( /**Event*/ evt) {
                _configureNewBlock([evt.item]);
            }
        });


        // configure #structure-models to allow drag with clone option
        new Sortable(document.getElementById("structure-models"), {
            handle: '.drag', // handle's class
            dragClass: "sortable-drag",
            filter: ".disable_dynamic",
            preventOnFilter: false,
            group: {
                name: 'structure',
                pull: 'clone',
                put: false // Do not allow items to be put into this list
            },
            animation: 150,
            sort: false // To disable sorting: set sort to false
        });

        // configure #element-models to allow drag with clone option
        new Sortable(document.getElementById("element-models"), {
            group: {
                name: 'dataviz',
                pull: 'clone',
                put: false // Do not allow items to be put into this list
            },
            animation: 150,
            sort: false // To disable sorting: set sort to false
        });

        // configure #dataviz-items to allow drag
        new Sortable(document.getElementById("dataviz-items"), {
            group: 'dataviz',
            animation: 150
        });

        // save report button action
        $("#btn_save_report").click(_saveReport);

        // update left menu after report selection with linked dataviz
        $("#selectedReportComposer").change(_onSelectReport);

        // update left menu after model selection with linked structure elements
        $("#selectedModelComposer").change(_selectTemplate);

        // configure modal to edit text
        $('#text-edit').on('show.bs.modal', _onTextEdit);
        // check dynamic bloc validity
        $(document).on('keyup', '#bootstrap_columns', _handleStructureBlocs);
        $(document).on('keypress', '#bootstrap_columns', _onlyIntegerInput);
        $('#separation_input').on('change', _changeOrientationInput);
        $(document).on('show.bs.modal', '#divide_form', _displayDivideModal);
        $(document).on('click', '#divide_modal_btn', _saveDivideConfig);




    };

    /*
     * _onSelectReport. This method is linked to #selectedReportComposer -event change-
     * to update dataviz items linked to selected report
     */

    var _onSelectReport = function (e) {
        // clear composition
        $("#report-composition .structure-bloc").remove();
        //Get reportid
        var reportId = $(this).val();
        //get and show report title
        var title = admin.getReportData(reportId).title;
        $("#composer-report-title").text(reportId);
        //Update dataviz items in menu list
        var lst = [];
        var dataviz_lst = admin.getReportData(reportId).dataviz;
        dataviz_lst.forEach(function (dvz) {
            if (dvz != null)
                var dvztpl = _datavizTemplate.join("");
            dvztpl = dvztpl.replace(/{{dvz}}/g, dvz);
            dvztpl = dvztpl.replace(/{{reportId}}/g, reportId);
            lst.push(dvztpl);
        });
        $("#dataviz-items .dataviz.list-group-item").remove();
        $("#dataviz-items").append(lst.join(""));
    };

    /*
     * _onTextEdit. This method is linked to #text-edit modal -event show-
     * to configure modal
     */

    var _onTextEdit = function (a) {
        //Get selected text element
        var source = a.relatedTarget.parentNode.firstChild;
        //store old text
        var oldtext = source.nodeValue;
        $("#text-edit-value").val(oldtext);
        //Get save button and remove existing handlers
        var btn = $(a.currentTarget).find(".text-save").off("click");
        //Add new handler to save button
        $(btn).click(function (e) {
            //get new text value and store it in composition
            var text = $("#text-edit-value").val();
            //get type content (text or html)
            var type = $('#text-edit input[name=typeedit]:checked').val();
            if (type === "text") {
                source.nodeValue = text;
            }
            //close modal
            $("#text-edit").modal("hide");
        });

    };

    /*
     * _configureNewBlock. This method configure fresh dropped blocks to be able to receive
     * and configure dataviz.
     */

    var _configureNewBlock = function (rows) {
        $(rows).each(function (id, row) {
            $(row).find(".dataviz-container").each(function (id, col) {
                new Sortable(col, {
                    group: 'dataviz',
                    filter: '.edit_columns',
                    preventOnFilter: false,
                    animation: 150,
                    onAdd: function ( /**Event*/ evt) {
                        //Test if title component
                        var test_title = $(evt.item).closest(".dataviz-container").parent().hasClass("report-bloc-title");

                        if (test_title) {
                            //No wizard needed. autoconfig this dataviz & deactivate wizard for this dataviz
                            var dataviz = $(evt.item).closest(".dataviz").attr("data-dataviz");
                            var elem = $.parseHTML(composer.activeModel().dataviz_components.title.replace("{{dataviz}}", dataviz));
                            var definition = elem[0].outerHTML;
                            // Inject dataviz definition directy
                            $(evt.item).find("code.dataviz-definition").text(definition);
                            //Set title icon & deactivate wizard button
                            var btn = $(evt.item).find(".tool button");
                            $(btn).removeAttr("data-target").removeAttr("data-toggle");
                            $(btn).find("i").get(0).className = "far fa-comment-dots";
                        } else if ($(evt.item).hasClass("structure-element") && $(evt.item).find(".editable-text:contains(edit)").length == 0) {
                            // add edit button near to editable text elements
                            var btn = $(evt.item).find(".editable-text").append('<span data-toggle="modal" data-target="#text-edit" class="to-remove text-edit badge badge-warning"><i class="fas fa-edit"></i>edit</span>').find(".text-edit");
                        }
                        /* TO DO FOR RESIZE */
                        // if(!evt.from.classList.contains("list-group")){
                        //     evt.from.style.maxHeight="125px";
                        // }
                        // col.classList.add("resized");
                        // var containers = document.querySelectorAll(".composition .dataviz-container:not(.resized)");

                        // containers.forEach(function(container){
                        //     container.style.minHeight = col.offsetHeight+"px";
                        // })
                        // evt.from.style.maxHeight="unset";
                        // col.classList.remove("resized");

                    }

                });
                $(row).find(".remove").click(function (e) {
                    //keep existing dataviz
                    $(e.currentTarget).closest(".structure-bloc").find(".dataviz").appendTo("#dataviz-items");
                    $(e.currentTarget).closest(".structure-bloc").remove();
                });
                if ($(row).find(".editable-text:contains(edit)").length == 0) {
                    // add edit button near to editable text elements
                    var btn = $(row).find(".editable-text").append('<span data-toggle="modal" data-target="#text-edit" class="to-remove text-edit badge badge-warning"><i class="fas fa-edit"></i>edit</span>').find(".text-edit");
                }


            });

        })


        //enable remove buton

    };

    /*
     * _configureNewElement. This method configure fresh dropped element
     */

    var _configureNewElement = function (elem) {
        console.log(elem);
    };

    /*
     * __exportHTML. This method is used to convert composer composition
     * into valid html ready to use in mreport.
     * Method is used by _saveReport method.
     */

    var _exportHTML = function () {
        var html = [];
        // Get first title
        $("#report-composition .report-bloc-title").each(function (id, title) {
            if (id === 0) {
                var dvz = $(title).find("code.dataviz-definition").text();
                html.push(dvz);
            }
        });
        //get blocs with their dataviz configuration
        $("#report-composition .report-bloc").each(function (id, bloc) {
            var tmp_bloc = $(bloc).clone();
            //delete extra row attributes
            ["data-model-title", "data-model-description"].forEach(function (attr) {
                $(tmp_bloc).removeAttr(attr);
            });
            //delete extra controls
            $(tmp_bloc).find(".to-remove").remove();
            $(tmp_bloc).find(".edit_columns").remove();
            // loop on dataviz-container
            $(tmp_bloc).find(".dataviz-container").each(function (id, container) {
                var pre_content = [];
                var main_content = [];
                var post_content = [];
                //loop on elements and dataviz
                $(container).find(".list-group-item").each(function (idx, item) {
                    var main_position = 0;
                    if ($(item).hasClass("dataviz")) {
                        var dvz = $(item).find("code.dataviz-definition").text();
                        dvz = _addTitleDescription(dvz);
                        main_content.push(dvz);
                        main_position = idx;
                    } else if ($(item).hasClass("structure-element")) {
                        var txt = $(item).find(".structure-element-html").html();
                        if (idx == 0) {
                            main_content.push(txt);
                        } else if (idx > main_position) {
                            post_content.push(txt);
                        } else {
                            pre_content.push(txt);
                        }

                    }
                });
                var tmp = $.parseHTML(main_content.join(""));

                $(tmp).prepend(pre_content.join(""));
                $(tmp).append(post_content.join(""));
                $(container).html(tmp);
                console.log(tmp);

            });
            html.push($(tmp_bloc).get(0).outerHTML);
        });

        // Get template style and inject it in html
        if (composer.activeModel().style) {
            html.push(composer.activeModel().style);
        }

        //generate html definition from template and composer elements
        var _page = $.parseHTML(_HTMLTemplates[_activeHTMLTemplate].page);
        var _export = $(_page).find(".report").append(html.join("\n")).parent().get(0).outerHTML;

        return _export;
    };

    /**
     * 
     * _addTitleDescription. Add to dataviz title and description if specified in the wizard
     */
    var _addTitleDescription = function (dvz) {
        var dvzHTML = $($.parseHTML(dvz)[0]);
        if (title = dvzHTML.find('.dataviz').data("title")) {
            dvzHTML.prepend('<div class="report-chart-title" data-model-icon="fas fa-text-width" data-model-title="Titre"><h6 class="editable-text">' + title + '</h6></div>');
            dvz = dvzHTML[0].outerHTML;
        }
        if (description = dvzHTML.find('.dataviz').data("description")) {
            dvzHTML.append('<div class="report-chart-summary mt-auto" data-model-icon="fas fa-align-justify" data-model-title="Description"><p class="editable-text">' + description + '</p></div>');
            dvz = dvzHTML[0].outerHTML;
        }
        return dvz;
    }

    /*
     * _compose.  This public method is used to activate composer for a given report
     * eg composer.compose("test");
     */

    var _compose = function (reportId) {
        //Show composeur page
        $("#btn-composer").click();
        //Set report select value
        $('#selectedReportComposer option[value="' + reportId + '"]').prop('selected', true).trigger("change");
    }

    /*
     * _saveTeport.  This method is used by #btn_save_report to
     * save active composition into dedicated report.html
     */

    var _saveReport = function () {
        var _report = $("#selectedReportComposer").val();
        var newDom = _exportHTML();
        console.log(newDom);
        $.ajax({
            type: "POST",
            url: [report.getAppConfiguration().api, "report_html", _report].join("/"),
            data: newDom,
            dataType: 'json',
            contentType: 'text/html',
            success: function (response) {
                if (response.response === "success") {
                    alert("Sauvegarde réussie");
                } else {
                    alert("enregistrement échec :" + response.response)
                }

            },
            error: function (a, b, c) {
                console.log(a, b, c);
            }
        });


    };
    var checkHorizontalBootstrap = function (input_value) {
        input_value = input_value.trim();
        var regex = new RegExp(/((1[0-2]|[1-9]) ){0,11}(1[0-2]|[1-9])/);
        var str_array = input_value.split(' ');

        var columns_sum = str_array.reduce((total, element) => {
            return parseInt(total) + parseInt(element);
        });
        return {
            "isValid": regex.test(input_value) && columns_sum == 12,
            "str_array": str_array
        };
    }
    var checkVerticalBootstrap = function (input_value) {
        input_value = input_value.trim();
        var regex = new RegExp(/((([27]5)|(50)) ){0,3}(([27]5)|(50)|(100))/);
        var allowedsums = [100, 75, 50, 25];
        var str_array = input_value.split(' ');

        var columns_sum = str_array.reduce((total, element) => {
            return parseInt(total) + parseInt(element);
        });
        return {
            "isValid": regex.test(input_value) && allowedsums.includes(parseInt(columns_sum)),
            "str_array": str_array
        };
    }
    var _handleStructureBlocs = function () {
        var str = $(this).val();
        var check = checkHorizontalBootstrap(str);
        if (check.isValid) {
            var columns_number = check.str_array.length;
            columns_number = columns_number > 1 ? columns_number + " colonnes" : columns_number + " colonne";
            var structure = '\
                <div class="lyrow report-bloc">\
                    <h4 class="bloc-title editable-text">Titre du bloc<!-- this text is editable in composer --></h4>\
                    <div class="view bloc-content">\
                    <div class="row">\
            ';
            check.str_array.forEach(elem => {
                structure +=
                    '<div class="col-md-' + elem + ' dividedcolumn customBaseColumn">\
                    <div class="edit_columns">\
                        <span class="badge badge badge-success divide_column" data-toggle="modal" data-target="#divide_form">\
                            <i class="fas fa-columns"></i>\
                            Diviser\
                        </span>\
                        <span class="badge badge badge-danger delete_column">\
                            <i class="far fa-trash-alt"></i>\
                        </span>\
                    </div>\
                    <div class="dataviz-container card list-group-item">\
                        <!--dataviz component is injected here -->\
                    </div>\
                </div>'
            });
            $(this).parent().siblings(":last").html(structure + '</div></div>\
            <div class="bloc-sources">\
                <div class="col">\
                    <p><i class="editable-text">SOURCE: xxx<!-- this text is editable in composer --></i></p>\
                </div>\
            </div>\
            </div>');
            $(this).parent().parent().removeClass("disable_dynamic");
            $(this).siblings("#nb_columns").html(columns_number);
        } else {
            $(this).parent().siblings(":last").html("");
            $(this).parent().parent().addClass("disable_dynamic");
        }

    }
    var _onlyIntegerInput = function (evt) {
        // Only ASCII charactar in that range allowed 
        var ASCIICode = (evt.which) ? evt.which : evt.keyCode
        if (ASCIICode > 31 && ASCIICode != 32 && (ASCIICode < 48 || ASCIICode > 57))
            return false;
        return true;
    }
    var _changeOrientationInput = function () {
        var elements = $(this).parent().next().find(".orientation_changed");
        if ($(this).val() == 0) {
            elements[0].setAttribute("placeholder", "Ex : 6 6");
            elements[1].innerHTML = "Le total doit être 12";
        } else {
            elements[0].setAttribute("placeholder", "Ex : 25 25 25 25");
            elements[1].innerHTML = "Le total doit être inferieur ou égal à 100 avec 4 valeurs maximum";
        }
    }
    var _displayDivideModal = function (evt) {
        _selectedCustomColumn = evt.relatedTarget.parentNode.nextElementSibling;
    }
    var _saveDivideConfig = function () {
        var columns_value = $("#dimensions_division").val();
        var columns_orientation = $("#separation_input").val().trim();
        if (columns_orientation == 0) {
            let check = checkHorizontalBootstrap(columns_value);
            if (check.isValid) {
                let parent = _selectedCustomColumn.parentNode;
                parent.classList.remove("dividedcolumn");
                _selectedCustomColumn.className = "lyrow";
                _selectedCustomColumn.previousElementSibling.remove();
                let savedContent = _selectedCustomColumn.querySelectorAll("li, div.structure-element");
                let saved = false;
                var structure = "<div class='view'><div class='row'>";
                check.str_array.forEach(function (column) {

                    structure +=
                        '<div class="col-md-' + column + ' dividedcolumn customBaseColumn">\
                        <div class="edit_columns">\
                            <span class="badge badge badge-success divide_column" data-toggle="modal" data-target="#divide_form">\
                                <i class="fas fa-columns"></i>\
                                Diviser\
                            </span>\
                            <span class="badge badge badge-danger delete_column">\
                                <i class="far fa-trash-alt"></i>\
                            </span>\
                        </div>\
                        <div class="dataviz-container card list-group-item">\
                            <!--dataviz component is injected here -->';
                    if (!saved && savedContent !== null) {
                        saved = true;
                        savedContent.forEach(function (elem) {
                            structure += elem.outerHTML;
                        });
                    }
                    structure +=
                        '</div>\
                    </div>'
                });
                structure += '</div>\
                </div>'
                _selectedCustomColumn.innerHTML = structure;
                _selectedCustomColumn.replaceWith(_selectedCustomColumn.cloneNode(true));
                _configureNewBlock(parent.querySelectorAll(".row"));
                $('#divide_form').modal('hide')
            }
        } else {
            let check = checkVerticalBootstrap(columns_value);
            if (check.isValid) {
                let parent = _selectedCustomColumn.parentNode;
                parent.classList.remove("dividedcolumn");
                _selectedCustomColumn.previousElementSibling.remove();
                let savedContent = _selectedCustomColumn.querySelectorAll("li, div.structure-element");
                _selectedCustomColumn.remove();
                let saved = false;
                var structure = "";
                check.str_array.forEach(function (row) {

                    structure +=
                        '<div class="lyrow verticalDivision">\
                        <div class="view">\
                        <div class="row">\
                        <div class="col-md-12 dividedcolumn customBaseColumn">\
                            <div class="edit_columns">\
                                <span class="badge badge badge-success divide_column" data-toggle="modal" data-target="#divide_form">\
                                    <i class="fas fa-columns"></i>\
                                    Diviser\
                                </span>\
                                <span class="badge badge badge-danger delete_column">\
                                    <i class="far fa-trash-alt"></i>\
                                </span>\
                            </div>\
                            <div class="dataviz-container card list-group-item">\
                                <!--dataviz component is injected here -->';
                    if (!saved && savedContent !== null) {
                        saved = true;
                        savedContent.forEach(function (elem) {
                            structure += elem.outerHTML;
                        });
                    }
                    structure +=
                        '</div>\
                        </div>\
                        </div>\
                        </div>\
                    </div>'
                });
                parent.innerHTML = structure;
                _configureNewBlock(parent.querySelectorAll(".row,.test"));
                $('#divide_form').modal('hide')
            }
        }



    }
    return {
        initComposer: _initComposer,
        compose: /* used by admin.js */ _compose,
        colors: /* used by wizard.js */ function () {
            return _HTMLTemplates[_activeHTMLTemplate].parameters.colors;
        },
        activeModel: /* used by wizard.js */ function () {
            return _HTMLTemplates[_activeHTMLTemplate];
        },
        models: /* used for test pupose */ function () {
            return _HTMLTemplates;
        },
    }; // fin return

})();

$(document).ready(function () {
    composer.initComposer();
    wizard.init();


});