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
        '<div class=" structure-bloc list-group-item">',
        '<span class="drag badge mreport-primary-color-2-bg">',
        '<i class="fas fa-arrows-alt"></i>',
        '<p id="drag-tag">drag</p>',
        '</span>',
        '<span class="remove badge mreport-primary-color-2-bg">',
        '<i class="fas fa-times"></i> remove',
        '</span>',
        '<span class="structure-description">',
        '{{{DESCRIPTION}}}',
        '</span>',
        '<div class="structure-html">{{{HTML}}}</div>',
        '</div>'
    ].join("");

    var _dynamicBootstrapBloc = [
        '<div class=" structure-bloc list-group-item disable_dynamic">',
        '<span class="remove badge ">',
        '<i class="fas fa-times"></i> remove',
        '</span>',
        '<span class="drag badge">',
        '<i class="fas fa-arrows-alt"></i>',
        '<p id="drag-tag">drag</p>',
        '</span>',
        '<span class="structure-description">',
         '<input id="bootstrap_columns" type="text" class="form-control col-8" placeholder="Ex : 6 6">',
        '<p id="nb_columns" class="d-none"></p>',
        '</span>',
        '<div class="structure-html">',
        '<div class="row  bloc-content">',
        '</div>',
        '</div>',
        '</div>'
    ].join("");

    /*
     * _extraElementTemplate - Array. This var is used to construct extra elements and append it
     * to dom with selected HTMLTemplate
     */

    var _extraElementTemplate = [
        [
            '<div class="structure-bloc list-group-item titleBloc" draggable="false" style="">',
            '<span class="drag badge ">',
            '<i class="fas fa-arrows-alt"></i>',
            '<p id="drag-tag"> drag</p>',
            '</span>',
            '<span class="editable-text">Texte</span>',
            '<span class="remove badge mreport-primary-color-2-bg structureElems">',
            '<i class="fas fa-times"></i> remove',
            '</span>',
            '</div>'
        ].join("")
    ];


    /*
     * _datavizTemplate - Array. This var is used to construct dataviz items and append them to dom
     * in #dataviz-items list
     */

    var _datavizTemplate = [
        '<li data-dataviz="{{id}}" title="{{dvz}}" data-report="{{reportId}}" class="dataviz list-group-item handle">',
        '<span class="drag badge ">',
        '<i class="{{icon}}"></i>',
        '<p id="drag-tag"> drag</p>',
        '</span>',
        '<div class="tool">',
        '<button class="btn btn-default" data-toggle="modal" data-component="report" data-related-id="{{id}}" data-target="#wizard-panel">',
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
        wizard.updateStyle(_HTMLTemplates[m]);
        //update icon store in wizard modal
        wizard.updateIconList(_HTMLTemplates[m]);
    }

    /*
     * _parseTemplate. This method is used to parse html template
     * and update composer IHM and _HTMLTemplates var with result
     */

    var _parseTemplate = function (templateid, html) {
        //Extra html elements needed to edit report (editable text, divide blocs...)
        var divide_element = [
            '<div class="edit_columns">',
                '<span class="badge mreport-primary-color-3-bg divide_column" data-toggle="modal"',
                    'data-target="#divide_form">',
                    '<i class="fas fa-columns"></i> <span>Diviser</span>',
                '</span>',
                '<span class="badge mreport-primary-color-3-bg delete_column">',
                    '<i class="fas fa-undo"></i><span>Vider</span>',
                '</span>',
            '</div>'
        ].join("");

        var editable_element = [
            '<span data-toggle="modal" data-target="#text-edit" class="to-remove text-edit btn mreport-primary-color-2-bg">',
                '<i class="fas fa-edit"></i>edit',
            '</span>'
        ].join("");

        // get data- linked to the template
        var parameters = $(html).data(); /* eg data-colors... */
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
            //add button to editable-text
            elem.querySelectorAll(".editable-text").forEach(function (t) {
                $(t).append(editable_element);
            })
            //add button to divide columns
            elem.querySelectorAll(".dividedcolumn.customBaseColumn").forEach(function (c) {
                $(c).prepend(divide_element);
            })
            var description = elem.getAttribute("data-model-title");
            blocs.push({
                "html": elem.outerHTML,
                "description": description
            });
        });
        //Store all blocs in structure - Array
        var structure = [];
        var extra_elements = [];
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
        _extraElementTemplate.forEach(elem => extra_elements.push(elem));
        //Populate _HTMLTemplates with object
        _HTMLTemplates[templateid] = {
            id: templateid,
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
        ["b"].forEach(function (m) {
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
            handle: '.drag',
            group: {
                name: 'structure',
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
        $('#dimensions_division').on('change', _changeDivideColumns);
        $(document).on('show.bs.modal', '#divide_form', _displayDivideModal);
        $(document).on('click', '#divide_modal_btn', _saveDivideConfig);
        $(document).on('click', 'span.delete_column', _deleteDvzFromComposer);




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
        $("#composer-report-title").text(title);
        const dc = Date.parse(new Date());
        $.ajax({
            type: "GET",
            url: ["/mreport", reportId, "report_composer.html?dc=" + dc].join("/"),
            success: function (html) {
                if (html.length > 0) {
                    let reportCompo = document.getElementById("report-composition");
                    reportCompo.innerHTML = html;
                    let alldvz = reportCompo.getElementsByClassName("dataviz");
                    for (elem of alldvz) {
                        wizard.getSampleData(elem.dataset.dataviz);
                    }
                    _configureNewBlock(reportCompo.querySelectorAll(".row"));
                    $("#report-composition .structure-bloc").find(".remove").click(function (e) {
                        $(e.currentTarget).closest(".structure-bloc").find(".dataviz").appendTo("#dataviz-items");
                        $(e.currentTarget).closest(".structure-bloc").remove();
                    });
                    $("#report-composition .structure-element").find(".structureElems").click(function (e) {
                        e.currentTarget.parentNode.remove();
                    });
                }
            },
            complete: function () {
                //Update dataviz items in menu list
                var lst = [];
                var dataviz_lst = admin.getReportData(reportId).dataviz;
                dataviz_lst.forEach(function (dvz) {
                    var dvzList = [...document.getElementById("report-composition").querySelectorAll(".dataviz-container .dataviz")];
                    var isAbsent = dvzList.every(function (oldDvz) {
                        return oldDvz.dataset.dataviz !== dvz.id;
                    })
                    if (isAbsent) {
                        if (dvz != null)
                            var dvztpl = _datavizTemplate.join("");
                        dvztpl = dvztpl.replace(/{{dvz}}/g, dvz.title);
                        dvztpl = dvztpl.replace(/{{id}}/g, dvz.id);
                        dvztpl = dvztpl.replace(/{{reportId}}/g, reportId);
                        dvztpl = dvztpl.replace(/{{type}}/g, dvz.type);
                        dvztpl = dvztpl.replace(/{{icon}}/g, _getDatavizTypeIcon(dvz.type));
                        lst.push(dvztpl);
                    }
                });
                $("#dataviz-items .dataviz.list-group-item").remove();
                $("#dataviz-items").append(lst.join(""));
            },
            error: function (error) {
                console.log(error);
            }
        });

    };

    var _getDatavizTypeIcon  = function (type) {
        let icon = 'fas fa-arrows-alt';
        switch (type) {
            case "chart":
            icon = "fas fa-chart-bar";
            break;
            case "table":
            icon = "fas fa-table";
            break;
            case "figure":
            icon = "fas fa-sort-numeric-down";
            break;
            case "title":
            icon = "fas fa-heading";
            break;
            case "map":
            icon = "fas fa-map-marker-alt";
            break;
            case "image":
            icon = "fas fa-image";
            break;
            case "iframe":
            icon = "fas fa-external-link-alt";
            break;
            case "text":
            icon = "fas fa-comment";
            break;
        }
        return icon;
    };

    /*
     * _onTextEdit. This method is linked to #text-edit modal -event show-
     * to configure modal
     */

    var _onTextEdit = function (a) {
        //Get selected text element
        var source = a.relatedTarget.parentNode;
        var oldtext;
        var oldtype;
        //store old text
        //check html content
        if (source.firstElementChild.nodeName === "DIV") {
            //HTMLcontent
            oldtext = source.firstChild.innerHTML;
            oldtype = "html";
        } else if (source.firstChild.nodeType === Node.TEXT_NODE){
            //TEXT CONTENT
            oldtext = source.firstChild.nodeValue.trim();
            oldtype = "text";
        }

        var getStyle = function () {
            let style = "undefined";
            source.classList.forEach(function (cls) {
                if (cls.indexOf("titre-")>=0) {
                    style = cls;
                }
            })
            return style;
        }

        //store old style
        var oldstyle = getStyle();

        var setStyle = function (style) {
            if (style !== oldstyle) {
                source.classList.remove(oldstyle);
                if (style && style !== 'undefined') {
                    source.classList.add(style);
                }
            }

        }

        $("#text-edit-value").val(oldtext);
        //get style value or Set default style
        $("#text-edit-level").val(getStyle());
        //Get save button and remove existing handlers
        var btn = $(a.currentTarget).find(".text-save").off("click");
        //Add new handler to save button
        $(btn).click(function (e) {
            //get new text value and store it in composition
            var text = $("#text-edit-value").val();
            //Get style
            var newstyle = $("#text-edit-level").val();
            //get type content (text or html)
            var type = $('#text-edit input[name=typeedit]:checked').val();
            if (type === "text") {
                //DElete old div node
                if (oldtype === "html") {
                    source.querySelector("div").remove();
                }
                source.firstChild.nodeValue = text.trim();
                setStyle(newstyle);
            } else if (type === "html") {
                //Check if div exists
                if (oldtype === "html") {
                    source.firstChild.innerHTML = text;
                } else {
                    //Create div element to store html
                    let div = document.createElement("div");
                    div.innerHTML = text;
                    //delete old texte node
                    source.firstChild.nodeValue = "";
                    //Use insert before to keep span child
                    source.insertBefore(div, source.firstChild);
                }
                setStyle(newstyle);
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
                            $(evt.item).addClass("full-width");
                            //Set title icon & deactivate wizard button
                            var btn = $(evt.item).find(".tool button");
                            $(btn).removeAttr("data-target").removeAttr("data-toggle");
                            $(btn).find("i").get(0).className = "fas fa-heading";
                        } else if ($(evt.item).hasClass("structure-element") && $(evt.item).find(".editable-text:contains(edit)").length == 0) {
                            // add edit button near to editable text elements
                            var btn = $(evt.item).find(".editable-text").append('<span data-toggle="modal" data-target="#text-edit" class="to-remove text-edit btn mreport-primary-color-2-bg"><i class="fas fa-edit"></i>edit</span>').find(".text-edit");
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
                    var btn = $(row).find(".editable-text").append('<span data-toggle="modal" data-target="#text-edit" class="to-remove text-edit btn mreport-primary-color-2-bg"><i class="fas fa-edit"></i>edit</span>').find(".text-edit");
                }
            });
            $(row).find(".structureElems").click(function (e) {
                e.currentTarget.parentNode.remove();
            });
            if (row.classList.contains("structure-element")) {
                let item = row;
                let editText = item.getElementsByClassName("editable-text")[0];
                if (editText) {
                    var span = document.createElement("span");
                    span.classList.add("to-remove", "text-edit", "badge", "mreport-grey1-bg");
                    span.dataset.target = "#text-edit";
                    span.dataset.toggle = "modal";
                    span.innerHTML = "edit";
                    var icon = document.createElement("i");
                    icon.classList.add("fas", "fa-edit");
                    span.prepend(icon);
                    editText.appendChild(span);
                }
            }

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
                var dvz = $(title).find("code.dataviz-definition");
                dvz.addClass("full-width");
                html.push(dvz.text());
            }
        });
        //get blocs with their dataviz configuration
        $("#report-composition .report-bloc,#report-composition .structure-element").each(function (id, bloc) {
            var tmp_bloc = $(bloc).clone();
            //delete extra row attributes
            ["data-model-title", "data-model-description"].forEach(function (attr) {
                $(tmp_bloc).removeAttr(attr);
            });
            //delete extra controls
            $(tmp_bloc).find(".to-remove").remove();
            $(tmp_bloc).find(".edit_columns").remove();
            if (tmp_bloc.hasClass("structure-element")) {
                $(tmp_bloc).find(".badge").remove();
                tmp_bloc.removeClass("list-group-item");
                let style = textedit.getTextStyle(tmp_bloc[0]);
                tmp_bloc[0] = textedit.applyTextStyle(tmp_bloc[0], style);
            } else {
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

                });
            }
            html.push($(tmp_bloc).get(0).outerHTML);
        });

        //generate html definition from template and composer elements
        var _page = $.parseHTML(_HTMLTemplates[_activeHTMLTemplate].page);
        var _export = $(_page).find(".report").append(html.join("\n")).parent().get(0).outerHTML;

        return _export;
    };
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
        var html_options = {tabString: '  '};
        var newDom = indent.html(_exportHTML(), html_options);
        var _css = ['<style>',
            composer.activeModel().style.match(/(?<=\<style\>)(.|\n)*?(?=\<\/style\>)/g)[0].trim(),
            composer.activeModel().iconstyle,
            '</style>']. join(" ");
        var composerHTML = document.getElementById("report-composition").innerHTML;
        composerHTML = indent.html(composerHTML, html_options);
        //get String beetwenn <style>...</style>
        var css = _css.substring(_css.lastIndexOf("<style>") + 7, _css.lastIndexOf("</style")).trim();
        $.ajax({
            type: "POST",
            url: [report.getAppConfiguration().api, "report_html", _report].join("/"),
            data: JSON.stringify({
                html: newDom,
                css: css,
                composer: composerHTML
            }),
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if (response.response === "success") {
                    Swal.fire({
                        title: 'Sauvegardé',
                        text: "Le rapport \'" + _report + "\' a été sauvegardé",
                        icon: 'success',
                        showCancelButton: true,
                        cancelButtonText: 'Ok',
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#32CD32',
                        confirmButtonText: 'Afficher'
                    }).then((result) => {
                        if (result.value) {
                            window.open("/mreport/" + _report, "_blank");
                        }
                    });
                } else {
                    alert("enregistrement échec :" + response.response)
                }

            },
            error: function (a, b, c) {
                console.log(a, b, c);
            }
        });


    };
    var checkHorizontalBootstrap = function (inputs) {
        var regex = new RegExp(/1[0-1]|[1-9]/);
        var test = true;
        var columns_sum = 0;
        for (input of inputs) {
            if (!regex.test(input.value.trim()))
                test = false;
            columns_sum += Number.parseInt(input.value)
        }
        return {
            "isValid": test && columns_sum == 12,
            "str_array": inputs
        };
    }
    var checkBootstrapForStructureBlocs = function (input_value) {
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
        return {
            "numberOfSplit": document.getElementById("dimensions_division").value.trim()
        };
    }
    var _handleStructureBlocs = function () {
        var str = $(this).val();
        var check = checkBootstrapForStructureBlocs(str);
        if (check.isValid) {
            var columns_number = check.str_array.length;
            columns_number = columns_number > 1 ? columns_number + " colonnes" : columns_number + " colonne"
            var structure = '\
                <div class="lyrow report-bloc">\
                    <h4 class="bloc-title editable-text">Titre du bloc<!-- this text is editable in composer --></h4>\
                    <div class="view bloc-content">\
                    <div class="row ">\
            ';
            check.str_array.forEach(elem => {
                structure +=
                    '<div class="col-md-' + elem + ' dividedcolumn customBaseColumn">\
                    <div class="edit_columns">\
                        <span class="badge mreport-primary-color-3-bg divide_column" data-toggle="modal" data-target="#divide_form">\
                            <i class="fas fa-columns"></i>\
                            Diviser\
                        </span>\
                        <span class="badge mreport-primary-color-3-bg delete_column">\
                            <i class="fas fa-undo"></i>\
                        <span>Vider</span>\
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
        var dimensionsInputs = document.getElementById("columns-inputs")
        if ($(this).val() == 0) {
            var row = document.createElement('div');
            row.classList.add("row");
            for (let i = 0; i < 2; i++) {
                let div = document.createElement("div");
                div.classList.add("col-4", "horizontal-column");
                let input = document.createElement("input");
                input.type = "number";
                input.classList.add("form-control");
                input.value = 6;
                div.appendChild(input);
                row.appendChild(div);
            }
            dimensionsInputs.prepend(row);
            dimensionsInputs.querySelector("small").innerHTML = "Le total doit être 12";
            _resetSelectForDivision(6);
        } else {
            var previousModel = dimensionsInputs.querySelector(".row");
            dimensionsInputs.querySelector("small").innerHTML = "Les divisions verticales ont toutes la même  taille";
            previousModel.parentNode.removeChild(previousModel);
            var row = document.createElement('div');
            _resetSelectForDivision(4);

        }
    }
    var _resetSelectForDivision = function (number) {
        var selectDimensions = document.getElementById("dimensions_division");
        selectDimensions.innerHTML = "";
        for (let i = 2; i <= number; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.text = i;
            selectDimensions.add(option);
        }
    }
    var _changeDivideColumns = function (event) {
        var separation = document.getElementById("separation_input").value;
        if (separation == 0) {
            var previousModel = document.getElementById("columns-inputs").querySelector(".row");
            previousModel.parentNode.removeChild(previousModel)
            var row = document.createElement('div');
            row.classList.add("row");
            for (let i = 0; i < event.target.value; i++) {
                let div = document.createElement("div");
                div.classList.add("col-4", "horizontal-column");
                let input = document.createElement("input");
                input.type = "text";
                input.classList.add("form-control");
                input.value = Math.floor(12 / event.target.value);
                div.appendChild(input);
                row.appendChild(div);
            }
            document.getElementById("columns-inputs").prepend(row);
        } else {

        }
    }
    var _displayDivideModal = function (evt) {
        _selectedCustomColumn = evt.relatedTarget.parentNode.nextElementSibling;
    }
    var _saveDivideConfig = function () {
        var columns_orientation = $("#separation_input").val().trim();
        if (columns_orientation == 0) {
            var inputs = document.getElementById("columns-inputs").querySelectorAll("input");
            let check = checkHorizontalBootstrap(inputs);
            if (check.isValid) {
                let parent = _selectedCustomColumn.parentNode;
                parent.classList.remove("dividedcolumn");
                _selectedCustomColumn.className = "lyrow";
                _selectedCustomColumn.previousElementSibling.remove();
                let savedContent = _selectedCustomColumn.querySelectorAll("li, div.structure-element");
                let saved = false;
                var structure = "<div class='view'><div class='row '>";
                check.str_array.forEach(function (column) {
                    structure +=
                        '<div class="col-md-' + column.value + ' dividedcolumn customBaseColumn">\
                        <div class="edit_columns">\
                            <span class="badge mreport-primary-color-3-bg divide_column" data-toggle="modal" data-target="#divide_form">\
                                <i class="fas fa-columns"></i>\
                                Diviser\
                            </span>\
                            <span class="badge mreport-primary-color-3-bg delete_column">\
                                <i class="fas fa-undo"></i>\
                                <span>Vider</span>\
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
            var numberOfSplit = document.getElementById("dimensions_division").value;
            let check = checkVerticalBootstrap(numberOfSplit);
            let parent = _selectedCustomColumn.parentNode;
            parent.classList.remove("dividedcolumn");
            _selectedCustomColumn.previousElementSibling.remove();
            let savedContent = _selectedCustomColumn.querySelectorAll("li, div.structure-element");
            _selectedCustomColumn.remove();
            let saved = false;
            var structure = "";
            let height = 100 / check.numberOfSplit;
            for (let i = 0; i < check.numberOfSplit; i++) {
                structure +=
                    '<div class="lyrow h-' + height + ' verticalDivision">\
                        <div class="view">\
                        <div class="row ">\
                        <div class="col-md-12 dividedcolumn customBaseColumn">\
                            <div class="edit_columns">\
                                <span class="badge mreport-primary-color-3-bg divide_column" data-toggle="modal" data-target="#divide_form">\
                                    <i class="fas fa-columns"></i>\
                                    Diviser\
                                </span>\
                                <span class="badge mreport-primary-color-3-bg delete_column">\
                                    <i class="fas fa-undo"></i>\
                                    <span>Vider</span>\
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
            };
            parent.innerHTML = structure;
            _configureNewBlock(parent.querySelectorAll(".row,.test"));
            $('#divide_form').modal('hide')

        }



    }
    var _deleteDvzFromComposer = function (e) {
        var deleteBtn = e.currentTarget;
        var linkedDvz = deleteBtn.parentNode.nextElementSibling.querySelectorAll(".dataviz");
        for (dvz of linkedDvz) {
            var dvzList = [...document.getElementById("dataviz-items").getElementsByClassName("dataviz")];
            var isAbsent = dvzList.every(function (oldDvz) {
                return oldDvz.dataset.dataviz !== dvz.dataset.dataviz;
            })
            if (isAbsent) {
                var dvztpl = _datavizTemplate.join("");
                dvztpl = dvztpl.replace(/{{dvz}}/g, dvz.title);
                dvztpl = dvztpl.replace(/{{id}}/g, dvz.dataset.dataviz);
                dvztpl = dvztpl.replace(/{{reportId}}/g, dvz.reportId);
                dvztpl = dvztpl.replace(/{{icon}}/g, _getDatavizTypeIcon(dvz.type));
                document.getElementById("dataviz-items").innerHTML += dvztpl;
            }
            dvz.parentNode.removeChild(dvz);
        }

    }
    return {
        initComposer: _initComposer,
        compose: /* used by admin.js */ _compose,
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
    //textedit.init();
});