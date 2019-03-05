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

    var _format = function (value) {
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

    var _getDom = function() {
        $.ajax({
            url: _home + "report.html",
            dataType: "text",
            success: function(html) {
                $("body").append(html);
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

    var _mergeJSON = function (obj) {
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
            result[dataid][dataviz] = {
                "label": [],
                "data": []
            };
            ndataset = 0;
            $.each(b.dataset, function(dataset, c) {
                ndataset += 1;
                result[dataid][dataviz].data.push(c.data);
                result[dataid][dataviz].label.push(c.label);

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
                console.log(data);

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
    var _drawViz = function(data, dataviz) {
        var filteredDataviz = [];
        if (dataviz) {
            filteredDataviz = dataviz.split(",");
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
                var el = document.getElementById(chiffrecle.id);
                var unit = $(el).attr("data-unit") || "";
                if (filteredDataviz.indexOf(chiffrecle.id) > -1) {
                    $(el).appendTo(".report-filtered .row");
                    $(el).removeClass().addClass("report-chart col-sm-12 col-md-12 col-lg-12");
                }
                if (el && data[chiffrecle.id]) {
                    el.getElementsByClassName("report-figure-chiffre")[0].textContent = _format(data[chiffrecle.id].data[0]) + unit;
                    if (el.getElementsByClassName("report-figure-caption").length > 0) {
                        el.getElementsByClassName("report-figure-caption")[0].textContent = data[chiffrecle.id].label[0];
                    }
                } else {
                    _handleVizError(el, chiffrecle.id, data);
                }
            });
        }

        /* Création des charts */

        var commonOptions = {
            "maintainAspectRatio": false
        };

        if (_config.charts) {
            _config.charts.forEach(function(chart) {
                var el = document.getElementById(chart.id);
                if (filteredDataviz.indexOf(chart.id) > -1) {
                    $(el).appendTo(".report-filtered .row");
                    $(el).removeClass().addClass("report-chart col-sm-12 col-md-12 col-lg-12");
                }
                if (el && data[chart.id]) {
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
                    console

                    var datasets = [];
                    // test if one or many datasets
                    if (Array.isArray( data[chart.id].data[0] )) {
                        // many datasets
                        console.log(chart.id + "many datasets");
                        var _datasets = data[chart.id].data;
                        _datasets.forEach(function (dataset, id) {
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

            });
        }

        if (_config.tables) {

            //ATTENTION POUR LES TABLEAUX, 1 DATASET est le contenu d'une colonne.
            _config.tables.forEach(function(table) {
                var el = document.getElementById(table.id);
                if (filteredDataviz.indexOf(table.id) > -1) {
                    $(el).appendTo(".report-filtered .row");
                    $(el).removeClass().addClass("report-table col-sm-12 col-md-12 col-lg-12");
                }
                if (el && data[table.id] && table.label) {
                    // construction auto de la table
                    var columns = [];
                    table.label.forEach(function(col, id) {
                        columns.push('<th scope="col">' + col + '</th>');
                    });

                    var data_rows = [];
                    // Use first colun data to collect other columns data
                    data[table.id].data[0].forEach(function(value, id) {
                        var values = [];
                        table.label.forEach(function(col, cid) {
                            values.push(_format(data[table.id].data[cid][id]));
                        });
                        data_rows.push(values);
                    });

                    console.log(data_rows, data[table.id]);

                    rows = [];
                    data_rows.forEach(function (row, id ) {
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


            });
        }

        if (_config.texts) {
            _config.texts.forEach(function(text) {
                var el = document.getElementById(text.id);
                if (filteredDataviz.indexOf(text.id) > -1) {
                    $(el).appendTo(".report-filtered .row");
                    $(el).removeClass().addClass("report-text col-sm-12 col-md-12 col-lg-12");
                }
                if (el && data[text.id]) {
                    el.getElementsByClassName("report-text-text")[0].textContent = data[text.id].data[0];
                    el.getElementsByClassName("report-text-title")[0].textContent = data[text.id].label[0];
                } else {
                    _handleVizError(el, text.id, data);
                }
            });
        }
        if (_config.images) {
            _config.images.forEach(function(image) {
                var el = document.getElementById(image.id);
                if (filteredDataviz.indexOf(image.id) > -1) {
                    $(el).appendTo(".report-filtered .row");
                    $(el).removeClass().addClass("report-image col-sm-12 col-md-12 col-lg-12");
                }
                if (el && data[image.id]) {
                    $(el).append('<img src="' + data[image.id].data[0] + '" class="img-fluid" alt="' + data[image.id].label[0] + '">');
                } else {
                    _handleVizError(el, image.id, data);
                }

            });
        }

        if (_config.iframes) {
            _config.iframes.forEach(function(iframe) {
                var el = document.getElementById(iframe.id);
                if (filteredDataviz.indexOf(iframe.id) > -1) {
                    $(el).appendTo(".report-filtered .row");
                    $(el).removeClass().addClass("report-iframe col-sm-12 col-md-12 col-lg-12");
                }
                if (el && data[iframe.id]) {
                    var html = '<iframe class="embed-responsive-item" src="' + data[iframe.id].data[0] + '"></iframe>';

                    $(el).append(html);
                } else {
                    _handleVizError(el, iframe.id, data);
                }

            });
        }

        if (_config.maps) {
            _config.maps.forEach(function(map) {
                var el = document.getElementById(map.id);
                var id = map.id + "-map";
                $(el).append('<div id="' + id + '" style="width:auto;height:300px;"><div>');
                var zoom = data[map.id].data[2];
                var center = data[map.id].data.slice(0, 2);
                var _map = L.map(id).setView(center, zoom);
                _map.zoomControl.remove();
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(_map);
                L.marker(center).addTo(_map).bindPopup(data[map.id].label[0]);
            });
        }

        if (_config.share) {
            $.ajax({
                url: "html/share.html",
                dataType: "text",
                success: function(html) {
                    $("body").append(html);
                    $(".report-chart, .report-table, .report-text, .report-image, .report-group").prepend('<button type="button" class="report-share btn btn-outline-info" data-toggle="modal" data-target="#share-panel">Partager</button>');
                    $(".report-share").click(function(e) {
                        var el = $(e.currentTarget).parent();
                        var obj = [];
                        if (el.hasClass("report-group")) {
                            el.find(".report-group-item").toArray().forEach(function (item) {
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
        setTitle: _setTitle,
        init: _init

    }; // fin return

})();

$(document).ready(function() {
    report.init();
});
$(window).load(function(){
	$('#preloader').fadeOut('slow',function(){$(this).remove();});
});