import_wizard = (function () {
    /*
     * Private
     */
    var _importData = {};

    var _importLoadLocalFile = function (file) {
        if (!file) {
            file = document.getElementById("import-file-input").files[0];
        }
        if (file) {
            var reader = new FileReader();

            //Constraint : file must be encoded in UTF-8 and first line is named fields
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                //Parse csv file to convert it as json object
                var csv = Papa.parse(evt.target.result, { header: true });
                var fields = csv.meta.fields;
                _importData = csv;
                $("#lst_fields a").remove();
                $("#data-result thead th").remove();
                $("#data-result tbody tr").remove();
                //show 5 first rows in table and populate draggable fields list
                let items = [];
                let theads = ['<tr>'];
                let trows = [];
                fields.forEach(function(fld) {
                    items.push(`<a href="#" data-field="${fld}" class="field list-group-item list-group-item-action list-group-item-warning">${fld}<i class="fas"></i></a>`);
                    theads.push(`<th scope="col">${fld}</th>`);

                });
                theads.push('</tr>');
                $("#data-result thead").append(theads.join(""));
                for (let i = 0; i < 5; i++) {
                    let tr = [];
                    fields.forEach(function(fld) {
                        tr.push(`<td>${csv.data[i][fld]}</td>`);
                    });
                    trows.push(`<tr>${tr.join("")}</tr>`);
                }
                $("#data-result tbody").append(trows.join(""));

                $("#lst_fields").append(items.join(""));
                ["lst_fields", "lst_fields_datasets", "lst_field_label", "lst_field_dataid"].forEach(function(id) {
                    let options = {
                        group: 'fields', // set both lists to same group
                        animation: 150,
                        onMove: function (evt) {
                            // limit to one field
                            if (['lst_field_label', 'lst_field_dataid'].includes(evt.to.id)) {
                                if ($(evt.to).find('.field').length >= 1) {
                                return false;
                                }
                            }
                        },
                        onAdd: function (evt) {
                            //Check if transformation is complete
                            if ($("#import_params .param:has(a)").length === 3) {
                                _setStatus(3);
                                _testTransformation();
                            } else {
                                _setStatus(2);
                            }

                        }
                    };
                    new Sortable(document.getElementById(id), options);
                });
                _setStatus("2");
            }
            console.log(file);
        }
    };

    var _testTransformation = function () {
        $("#transformation-result tbody tr").remove();
        var options = _getOptions();
        var rawdata = _transformData(_importData.data, options, 5);
        var table = [];
        rawdata.forEach(function(tr) {
            table.push(`<tr><td>${tr.dataid}</td><td>${tr.dataset}</td><td>${tr.order}</td><td>${tr.label}</td><td>${tr.data}</td></tr>`);
        });

        $("#transformation-result tbody").append(table.join(""));
    };

    var _getOptions = function () {
        var options = {};
        document.querySelectorAll("#import_params .param").forEach(function(param) {
            let fields = [];
            let parameter = param.dataset.parameter;
            param.querySelectorAll('.field').forEach(function(field) {
                fields.push(field.dataset.field);
            });
            if (parameter === 'datasets') {
                options[parameter] = fields;
            } else {
                options[parameter] = fields[0];
            }

        });
        return options;
    };



    var _importData = function () {
        if (!document.getElementById("dataviz-form2").checkValidity()) {
            return;
        }
        var options = _getOptions();
        let dvz = {};
        let sa = $("#dataviz-form2").serializeArray();
        sa.forEach(function (r) {
            if (r.value) {
                dvz[r.name] = r.value;
            }
        });

        dvz.job = 'IHM-manual-import';
        dvz.type = 'simple';

        var rawdata = _transformData(_importData.data, options);
        _saveDatavizAndDatas(dvz, rawdata);

    }

    var _transformData = function (csv, options, limit) {
        var result = [];
        options.datasets.forEach(function (dataset) {
            let order = 0;
            csv.forEach(function(raw) {
                let value = raw[dataset];
                let ds = dataset
                let label = raw[options.label];
                let dataid = raw[options.dataid];
                if (label && dataid && value) {
                    order += 1;
                    if (!limit || order <= limit) {
                        result.push({dataset: ds, dataid: dataid, "label": label, order: order, data: value});
                    }

                }

            });
        });
        //return Papa.unparse(result, {header: true, delimiter: '\t'});
        return result;

    };

    _saveDatavizAndDatas = function (dvz, rawdata) {
        var datavizid = "viz-" + Date.parse(new Date());
        //update dataviz attribute
        rawdata.forEach(function(item) {
            item.dataviz = datavizid;
        });
        console.log(JSON.stringify(rawdata));

        var _saveData = function () {
            $.ajax({
                dataType: "json",
                contentType: "application/json",
                type: "PUT",
                data: JSON.stringify(rawdata),
                url: [report.getAppConfiguration().api, "store", datavizid,"data"].join("/"),
                success: function (data) {
                    if (data.response === "success") {
                            Swal.fire(
                                'Modifié',
                                'Les données ont été ajoutées à la dataviz \'' + datavizid + '\'',
                                'success'
                            )

                    } else {
                        var err = data.error;
                        Swal.fire(
                            'Une erreur s\'est produite',
                            err,
                            'error'
                        );
                    }
                },
                error: function (xhr, status, error) {
                    var err = _parseError(xhr.responseText);
                    Swal.fire(
                        'Une erreur s\'est produite',
                        err,
                        'error'
                    )
                }
            });
        };

        var _saveDataviz = function (datavizid, dvz) {
            $.ajax({
                dataType: "json",
                contentType: "application/json",
                type: "PUT",
                data: JSON.stringify(dvz),
                url: [report.getAppConfiguration().api, "store", datavizid].join("/"),
                success: function (data) {
                    if (data.response === "success") {
                            Swal.fire(
                                'Modifié',
                                'La dataviz \'' + datavizid + '\' a été ajoutée',
                                'success'
                            )
                            //TODO update dataviz list
                            _saveData();


                    } else {
                        var err = data.error;
                        Swal.fire(
                            'Une erreur s\'est produite',
                            err,
                            'error'
                        );
                    }
                },
                error: function (xhr, status, error) {
                    var err = _parseError(xhr.responseText);
                    Swal.fire(
                        'Une erreur s\'est produite',
                        err,
                        'error'
                    )
                }
            });
        };

        _saveDataviz(datavizid, dvz);


    };

    var _clear = function () {
        _setStatus(0);
        document.getElementById('import-file-form').reset();
    };

    var _init = function () {
        //load import html dynamicly and append it admin.html
        $.ajax({
            url: "/static/html/import.html",
            dataType: "text",
            success: function (html) {
               var _html = $("<div></div>").append(html)[0];
               _html.querySelectorAll("template").forEach(function(template) {
                    if (template.dataset.target) {
                        //inject import modal and button in admin.html
                        document.querySelector(template.dataset.target).prepend(template.content.firstElementChild);
                    }

               });

               bsCustomFileInput.init();
                $('.steps a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
                    document.getElementById("import-modal-form").dataset.step = e.target.dataset.step;
                });

               document.querySelectorAll('#dataviz-form2 input').forEach(function(elem) {
                    elem.addEventListener('change', (event) => {
                        if (document.getElementById("dataviz-form2").checkValidity()) {
                            document.getElementById("import_data-btn").removeAttribute("disabled");
                        } else {
                            document.getElementById("import_data-btn").setAttribute("disabled","");
                        }

                    });
               });


            }
        });

    };

    var _selectLocalFile = function() {
        _setStatus("1");
    };

    var _setStatus = function(num) {
        let _class = "status-";
        let activeStatus = "";
        let modal = document.getElementById("import-modal-form");
        modal.classList.forEach( function (c) {
            if (c.indexOf(_class) === 0) {
                activeStatus = c;
            }
        });
        modal.classList.remove(activeStatus);
        modal.classList.add(_class + num);
    }

    var _next = function () {
        let step = parseInt(document.getElementById("import-modal-form").dataset.step);
        $('#s'+ (step + 1) ).tab('show');
    }

    var _previous = function () {
        let step = parseInt(document.getElementById("import-modal-form").dataset.step);
        $('#s'+ (step - 1) ).tab('show');
    }

     /*
     * Public
     */

    return {
        transformData: _transformData,
        importData: _importData,
        importLoadLocalFile: _importLoadLocalFile,
        selectLocalFile: _selectLocalFile,
        init: _init,
        clear: _clear,
        next: _next,
        previous: _previous
    }; // fin return

})();
import_wizard.init();
