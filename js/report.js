/*
 * API
 *
 * use dataviz parameter in url to filter report by dataviz id.
 * eg ?dataviz=viz_1 or ?dataviz=viz_1,viz_2
 * id data source contains many items (item1, item2...),
 * use dataid in config.json.
 *
 */
report = (function() {
    /*
     * Private
     */


    var _config;

    var APIRequest = {};

    var _home = "reports/";

    var errors = false;

    var _data;

    var _filteredDataviz = [];

    var _format = function(value) {
        if (!isNaN(value)) {
            return parseFloat(value).toLocaleString();
        } else {
            return value;
        }
    }

    var _alert = function(msg, alert, show) {
        $("body").append('<div class="report-alert alert alert-' + alert + '" role="alert">' + msg + '</div>');
        errors = true;
        if (show) {
            $(".report-alert").show();
        }
    };

    var _handleVizError = function(el, id, data) {
        var error_msg = "";
        if (el) {
            error_msg = "erreur " + id + "\n pas de données pour cette dataviz";
        } else if (data[id]) {
            error_msg = "erreur " + id + "\n Elément html manquant";
        } else {
            error_msg = "erreur " + id + "\n Elément html et données manquants pour cette dataviz";
        }
        _alert(error_msg, "warning", false);
    }

    var _getCss = function() {
        $('head').prepend('<link rel="stylesheet" href="' + _home + "report.css" + '" type="text/css" />');
    };

    var _init = function() {
        //API GET PARAMETERS
        if (window.location.hash) {
            try {
                var hash = window.location.hash;
                if (hash.indexOf("?") > -1) {
                    var reportName = hash.split("?")[0].substring(1);
                    APIRequest = $.parseJSON('{"' + decodeURIComponent(hash.split("?")[1]
                        .replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');
                    APIRequest["report"] = reportName;
                    _home += reportName + "/";
                    /* test API Request Validity */
                    if (!APIRequest.report || !APIRequest.dataid) {
                        _alert("Paramètres non valides", "danger", true);
                        return;
                    }
                } else {
                    _alert("URL malformée /#monrapport?dataid=xx ", "danger", true);
                    return;
                }
            } catch (error) {
                _alert("URL malformée /#monrapport?dataid=xx " + error, "danger", true);
            }

        }

        if (!errors) {
            /* get config file*/
            $.ajax({
                dataType: "json",
                url: _home + "config.json",
                success: function(conf) {
                    _config = conf;
                    _getDom();
                    _getCss();
                },
                error: function(xhr, status, err) {
                    _alert("Erreur avec le rapport " + _home + " " + err, "danger", true);
                }
            });
        }

    };

    var _merge_config = function() {
        var dom = {};
        ["figure", "image", "text", "iframe", "title"].forEach(function(element) {
            // pas de conf pour ces éléments, il faut juster renseigner l'id
            dom[element] = $(".report-" + element).toArray();
            if (dom[element].length > 0) {
                var properties = dom[element].map(function(item) {
                    return {
                        "id": item.id
                    };
                });
                var conf = _config[element + "s"];
                if (element === "title") {
                    _config[element] = properties[0];
                } else {
                    if (!conf) {
                        _config[element + "s"] = [];
                        conf = _config[element + "s"];
                    }
                    $.extend(true, conf, properties);
                }
            }
        });

        ["chart", "table", "map"].forEach(function(element) {
            var conf = _config[element + "s"];
            if (!conf) {
                _config[element + "s"] = [];
            }
            dom[element] = $(".report-" + element).toArray();
            if (dom[element].length > 0) {
                var properties = dom[element].map(function(item) {
                    return $.extend($(item).data(), {
                        "id": item.id
                    });
                });
                properties.forEach(function(item) {
                    //append conf if not in config.json only
                    var current_element = _config[element + "s"].filter(function(o) {
                        return o.id === item.id
                    });
                    if (current_element.length === 0) {
                        var prop = {
                            "id": item.id
                        };
                        if (element === "chart") {
                            if (item.label) {
                                if (item.label.indexOf(",") > 0) {
                                    prop["label"] = item.label.split(",");
                                } else {
                                    prop["label"] = item.label;
                                }
                            }
                            if (item.colors) {
                                prop["colors"] = item.colors.split(",");
                            }
                            if (item.type) {
                                prop["type"] = item.type;
                            }
                            if (item.opacity) {
                                prop["opacity"] = parseFloat(item.opacity);
                            }


                        } else if (element === "table") {
                            if (item.label) {
                                prop["label"] = item.label.split(",");
                            }
                            if (item.extracolumn) {
                                prop["extracolumn"] = item.label;
                            }
                            if (item.columns) {
                                prop["columns"] = item.columns.split(",").map(function(value) {
                                    return Number(value) - 1;
                                });
                            }

                        } else if (element === "map") {
                            if (item.zoom) {
                                prop["zoom"] = Number(item.zoom);
                            }
                        } else {
                            console.log(element, item);
                        }
                        _config[element + "s"].push(prop);
                    }
                });
            }
        });
        console.log("CONFIGURATION", _config);

    };


    var _getDom = function() {
        $.ajax({
            url: _home + "report.html",
            dataType: "text",
            success: function(html) {
                $("body").append(html);
                //append _config
                _merge_config();
                _getData();
            },
            error: function(xhr, status, err) {
                _alert("Erreur avec le fichier report.html de " + _home + " " + err, "danger", true);
            }
        });
    };

    var _cleanDom = function(dataviz) {
        if (dataviz) {
            $(".report, .alert").remove();
        }
    };

    var _parseCSV = function(csv) {
        var tmp = Papa.parse(csv, {
            header: true
        });
        return _mergeJSON(tmp.data);
    };

    var _mergeJSON = function(obj) {
        var json = {};
        var result = {};
        obj.forEach(function(raw, id) {
            /* ecriture d'un nouvel objet json de la forme {ecluse1: {chart1: {data:[1,2,3], label:[v1,v2,v3]}, chart2: {...}}}
            Si plusieurs datasets présents data est de la forme data: [[dataset1], [dataset2]] --> [[1,2,3], [4,5,6]]*/
            // merge dataid, dataviz, dataset
            if (json[raw.dataid]) {
                // test dataviz
                if (json[raw.dataid].dataviz[raw.dataviz]) {
                    // test dataset
                    if (json[raw.dataid].dataviz[raw.dataviz].dataset[raw.dataset]) {
                        json[raw.dataid].dataviz[raw.dataviz].dataset[raw.dataset].data.push(raw.data);
                        json[raw.dataid].dataviz[raw.dataviz].dataset[raw.dataset].label.push(raw.label);
                    } else {
                        //creation du dataset et alimentation data et label
                        json[raw.dataid].dataviz[raw.dataviz].dataset[raw.dataset] = {
                            label: [raw.label],
                            data: [raw.data]
                        };
                    }

                } else {
                    // new dataviz
                    json[raw.dataid].dataviz[raw.dataviz] = {
                        "dataset": {}
                    };
                    //creation du dataset et alimentation data et label
                    json[raw.dataid].dataviz[raw.dataviz].dataset[raw.dataset] = {
                        label: [raw.label],
                        data: [raw.data]
                    };

                }
            } else {
                if (raw.dataid) {
                    // new dataid
                    json[raw.dataid] = {
                        "dataviz": {}
                    };
                    //creation du dataviz
                    json[raw.dataid].dataviz[raw.dataviz] = {
                        "dataset": {}
                    };
                    //creation du dataset et alimentation data et label
                    json[raw.dataid].dataviz[raw.dataviz].dataset[raw.dataset] = {
                        label: [raw.label],
                        data: [raw.data]
                    };
                }

            }
        });



        // merge data and labels for each dataset
        $.each(json, function(dataid, a) {
            result[dataid] = {};
            $.each(a.dataviz, function(dataviz, b) {
                var significative_labels = true;
                result[dataid][dataviz] = {
                    "label": [],
                    "data": [],
                    "dataset": [],
                    "rows": 0,
                    "significative_label": null
                };
                ndataset = 0;
                $.each(b.dataset, function(dataset, c) {
                    ndataset += 1;
                    var rows = c.data.length;
                    if (significative_labels) {
                        var distinct_labels = [];
                        c.label.forEach(function(label) {
                            if (!distinct_labels.includes(label)) {
                                distinct_labels.push(label);
                            }
                        });
                        if (distinct_labels.length < rows) {
                            significative_labels = false;
                        }
                    }

                    result[dataid][dataviz].data.push(c.data);
                    result[dataid][dataviz].label.push(c.label);
                    result[dataid][dataviz].dataset.push(dataset);
                    result[dataid][dataviz].significative_label = significative_labels;
                    result[dataid][dataviz].rows = rows;

                });
                if (ndataset === 1) {
                    result[dataid][dataviz].data = result[dataid][dataviz].data[0];
                }
                result[dataid][dataviz].label = result[dataid][dataviz].label[0];
            });

        });


        return result;

    };


    var _getData = function() {
        var request_parameters = {};
        request_parameters[_config.dataid] = APIRequest.dataid;
        _config.data_other_parameters.forEach(function(parameter) {
            if (APIRequest[parameter]) {
                request_parameters[parameter] = APIRequest[parameter];
            }
        });
        // test url (relative or absolute)
        var url = "";
        if (/^(?:[a-z]+:)?\/\//i.test(_config.data_url)) {
            url = _config.data_url;
        } else {
            url = _home + _config.data_url;
        }

        var format = "json";
        if (_config.data_format === "csv") {
            format = "text";
        }

        $.ajax({
            dataType: format,
            url: _home + _config.data_url,
            data: request_parameters,
            success: function(data) {
                if (format === "text") {
                    data = _parseCSV(data);
                } else if (format === "json") {
                    data = _mergeJSON(data);
                }

                data = data[APIRequest.dataid];
                _data = data;

                if (data && typeof data === 'object' && Object.getOwnPropertyNames(data).length > 1) {
                    report.drawViz(data, APIRequest.dataviz);
                    if (data[_config.title.id]) {
                        report.setTitle(data[_config.title.id].label);
                    }
                    _cleanDom(APIRequest.dataviz);
                } else {
                    var msg = "absence de données " + _config.data_url + " : " + request_parameters[_config.dataid];
                    _alert(msg, "warning", true);
                }

            },
            error: function(xhr, status, error) {
                var msg = "erreur " + _config.data_url + " : " + error;
                _alert(msg, "danger", true);
            }
        });
    };

    const hexToRgb = hex =>
        hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16))



    var _setTitle = function(title) {
        document.getElementsByClassName("report-title")[0].textContent = title;
        document.title = title;
    };

    var _vizEnabled = function(id) {
        var enabled = true;
        if (_filteredDataviz.length > 0 && !_filteredDataviz.includes(id)) {
            enabled = false;
        }
        return enabled;
    };

    var _createChart = function(data, chart) {
        if (!_vizEnabled(chart.id)) {
            return;
        }
        var el = _getDomElement("chart", chart.id);
        if (el && data[chart.id]) {
            var commonOptions = {
                "maintainAspectRatio": false
            };
            var colors = ["#36A2EB"];
            var backgroundColors = []
            var borderColors = [];
            if (chart.colors.length > 0) {
                colors = chart.colors;
            }
            colors.forEach(function(color) {
                backgroundColors.push('rgba(' + hexToRgb(color).join(',') + ',' + (chart.opacity || 0.5) + ')');
                borderColors.push('rgba(' + hexToRgb(color).join(',') + ', 1)');
            });
            var datasets = [];
            // test if one or many datasets
            if (Array.isArray(data[chart.id].data[0])) {
                // many datasets
                var _datasets = data[chart.id].data;
                _datasets.forEach(function(dataset, id) {
                    datasets.push({
                        label: chart.label[id],
                        data: dataset,
                        backgroundColor: backgroundColors[id],
                        borderColor: borderColors[id],
                        borderWidth: 1
                    });
                });


            } else {
                // one dataset
                if (colors.length === 1) {
                    backgroundColors = backgroundColors[0];
                    borderColors = borderColors[0];
                }
                datasets.push({
                    label: chart.label,
                    data: data[chart.id].data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                });
            }

            $(el).prepend('<canvas id="' + chart.id + '-canvas" width="400" height="200"></canvas>');
            var options = $.extend({}, commonOptions, chart.options);
            var ctx = document.getElementById(chart.id + "-canvas").getContext('2d');
            var chart = new Chart(ctx, {
                type: chart.type || 'bar',
                data: {
                    labels: data[chart.id].label,
                    datasets: datasets
                },
                options: options
            });
        } else {
            _handleVizError(el, chart.id, data);
        }
    };

    var _createFigure = function(data, chiffrecle) {
        if (!_vizEnabled(chiffrecle.id)) {
            return;
        }
        var el = _getDomElement("figure card", chiffrecle.id);
        var unit = $(el).attr("data-unit") || "";
        if (el && data[chiffrecle.id]) {
            el.getElementsByClassName("report-figure-chiffre")[0].textContent = _format(data[chiffrecle.id].data[0]) + unit;
            if (el.getElementsByClassName("report-figure-caption").length > 0) {
                el.getElementsByClassName("report-figure-caption")[0].textContent = data[chiffrecle.id].label[0];
            }
        } else {
            _handleVizError(el, chiffrecle.id, data);
        }
    };

    var _createTable = function(data, table) {
        if (!_vizEnabled(table.id)) {
            return;
        }
        var el = _getDomElement("table", table.id);
        if (el && data[table.id] && table.label) {
            // construction auto de la table
            var columns = [];
            var datasets_index = [];
            if (table.columns && table.columns.length > 0) {
                datasets_index = table.columns;

            } else {
                data[table.id].dataset.forEach(function(element, id) {
                    datasets_index.push(id);
                });
            }
            console.log(datasets_index);
            if (table.extracolumn) {
                columns.push('<th scope="col">' + table.extracolumn + '</th>');
            }
            table.label.forEach(function(col, id) {
                columns.push('<th scope="col">' + col + '</th>');
            });

            var data_rows = [];
            // Use first colun data to collect other columns data
            data[table.id].data[0].forEach(function(value, id) {
                var values = [];
                if (table.extracolumn) {
                    values.push(data[table.id].label[id]);
                }
                datasets_index.forEach(function(dataset_index, cid) {
                    values.push(_format(data[table.id].data[dataset_index][id]));
                });
                data_rows.push(values);
            });

            rows = [];
            data_rows.forEach(function(row, id) {
                var elements = [];
                row.forEach(function(column) {
                    elements.push('<td>' + column + '</td>');
                });
                rows.push('<tr>' + elements.join("") + '</tr>');

            });

            var html = ['<table class="table table-bordered">',
                '<thead class="thead-light">',
                '<tr>' + columns.join("") + '</tr></thead>',
                '<tbody>' + rows.join("") + '</tbody></table>'
            ].join("");

            $(el).append(html);

        } else {
            _handleVizError(el, table.id, data);
        }
    };

    var _createText = function(data, text) {
        if (!_vizEnabled(text.id)) {
            return;
        }
        var el = _getDomElement("text", text.id);
        if (el && data[text.id]) {
            el.getElementsByClassName("report-text-text")[0].textContent = data[text.id].data[0];
            el.getElementsByClassName("report-text-title")[0].textContent = data[text.id].label[0];
        } else {
            _handleVizError(el, text.id, data);
        }
    };

    var _createImage = function(data, image) {
        if (!_vizEnabled(image.id)) {
            return;
        }
        var el = _getDomElement("image", image.id);
        if (el && data[image.id]) {
            $(el).append('<img src="' + data[image.id].data[0] + '" class="img-fluid" alt="' + data[image.id].label[0] + '">');
        } else {
            _handleVizError(el, image.id, data);
        }
    };

    var _createIframe = function(data, iframe) {
        if (!_vizEnabled(iframe.id)) {
            return;
        }
        var el = _getDomElement("iframe", iframe.id);
        if (el && data[iframe.id]) {
            var html = '<iframe class="embed-responsive-item" src="' + data[iframe.id].data[0] + '"></iframe>';

            $(el).append(html);
        } else {
            _handleVizError(el, iframe.id, data);
        }
    };

    var _getDomElement = function(classe, id) {
        var el = document.getElementById(id);
        if (_filteredDataviz.indexOf(id) > -1) {
            $(el).appendTo(".report-filtered .row");
            $(el).removeClass().addClass("report-" + classe + " col-sm-12 col-md-12 col-lg-12");
        }
        return el;
    }

    var _createMap = function(data, map) {
        var el = _getDomElement("map", map.id);
        var id = map.id + "-map";
        $(el).append('<div id="' + id + '" style="width:auto;height:300px;"><div>');
        var zoom = map.zoom || 16;
        var datasets_nb = data[map.id].dataset.length;
        var points_nb = data[map.id].rows;
        var points = [];
        var center = [48, 0];
        if (datasets_nb === 1) {
            // une typologie de points
            if (points_nb === 1) {
                //un seul point
                center = data[map.id].data[0].split("@").map(Number);
                points.push(data[map.id].data[0].split("@").map(Number));
            } else {
                //plusieurs points
                data[map.id].data.forEach(function(pt) {
                    points.push(pt.split("@").map(Number));
                });
            }
        } else {
            // Plusieurs typologies de points
            //TODO
        }
        var _map = L.map(id).setView(center, zoom);
        _map.zoomControl.remove();
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(_map);
        points.forEach(function(point, id) {
            L.marker(point).addTo(_map).bindPopup(data[map.id].label[id]);
        });
        _map.fitBounds(points);

    };

    var _testViz = function(data, type, properties) {
        switch (type) {
            case "chart":
                _createChart(data, properties);
                break;
            case "table":
                _createTable(data, properties);
                break;
            case "figure":
                _createFigure(data, properties);
                break;
            case "text":
                _createText(data, properties);
                break;
            case "image":
                _createImage(data, properties);
                break;
            case "iframe":
                _createIframe(data, properties);
                break;
            case "map":
                _createMap(data, properties);
                break;
        }
    };


    var _drawViz = function(data, dataviz) {
        if (dataviz) {
            _filteredDataviz = dataviz.split(",");
            $("body").prepend('<div class="report-filtered container-fluid"><div class="row"></div></div>');
            // deactivate share func.
            _config.share = false;
        }

        /* Listing des données non valorisées dans ce rapport  */

        $.each(data, function(id) {
            var vizs = ["charts", "figures", "texts", "maps", "images", "iframes", "tables", "title"];
            var used = false;
            vizs.forEach(function(viz) {
                if (viz === "title") {
                    if (_config[viz] && _config[viz].id === id) {
                        used = true;
                    }
                } else {
                    if (_config[viz] && _config[viz].filter(function(item) {
                            return item.id === id
                        }).length > 0) {
                        used = true;
                    }
                }
            });
            if (!used) {
                console.log(id + " n'est pas utilisé dans ce rapport");
            }


        });

        /* Création des chiffres clés */
        if (_config.figures) {
            _config.figures.forEach(function(chiffrecle) {
                _createFigure(data, chiffrecle);
            });
        }

        /* Création des charts */
        if (_config.charts) {
            _config.charts.forEach(function(chart) {
                _createChart(data, chart);
            });
        }

        if (_config.tables) {
            //ATTENTION POUR LES TABLEAUX, 1 DATASET est le contenu d'une colonne.
            _config.tables.forEach(function(table) {
                _createTable(data, table);
            });
        }

        if (_config.texts) {
            _config.texts.forEach(function(text) {
                _createText(data, text);
            });
        }
        if (_config.images) {
            _config.images.forEach(function(image) {
                _createImage(data, image);
            });
        }

        if (_config.iframes) {
            _config.iframes.forEach(function(iframe) {
                _createIframe(data, iframe);
            });
        }

        if (_config.maps) {
            _config.maps.forEach(function(map) {
                _createMap(data, map);
            });
        }

        if (_config.share) {
            $.ajax({
                url: "html/share.html",
                dataType: "text",
                success: function(html) {
                    $("body").append(html);
                    $(".report-chart, .report-table, .report-text, .report-image, .report-group, .report-figure.card").prepend('<button type="button" class="report-share btn btn-outline-info" data-toggle="modal" data-target="#share-panel">Partager</button>');
                    $(".report-share").click(function(e) {
                        var el = $(e.currentTarget).parent();
                        var obj = [];
                        if (el.hasClass("report-group")) {
                            el.find(".report-group-item").toArray().forEach(function(item) {
                                obj.push(item.id);
                            });
                        } else {
                            obj.push($(e.currentTarget).parent().attr("id"));
                        }
                        var url = $(location).attr('href') + "&dataviz=" + obj.join(",");

                        $(".report-share-info").attr("href", url);

                        var iframe = ['<div style="position:relative;display:block;height:0;',
                            'padding:0;overflow:hidden;padding-bottom:50%;">',
                            '<iframe style="position:absolute;top:0;bottom:0;',
                            'left:0;width:100%;height:100%;border:0;"',
                            'src="' + url + '"></iframe></div>'
                        ].join("\n");

                        $(".report-share-iframe").text(iframe);
                    });
                }
            });

        }

        if (_config.wizard || APIRequest.wizard) {
            wizard.init(_data);
        }

        if (errors && _config.debug) {
            $(".report-alert").show();
        }

        $(".report").fadeTo("slow", 1);

    };

    /*
     * Public
     */

    return {

        drawViz: _drawViz,
        testViz: _testViz,
        setTitle: _setTitle,
        init: _init

    }; // fin return

})();

$(document).ready(function() {
    report.init();
});
$(window).load(function() {
    $('#preloader').fadeOut('slow', function() {
        $(this).remove();
    });
});