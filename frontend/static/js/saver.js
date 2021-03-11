saver = (function () {
    /*
     * Private
     */


    /*
.report-bloc
    .bloc-title
    .bloc-content
        .row (r1)
            .customBaseColumn (rn)
                .dataviz-container (r1)
            .customBaseColumn (rn)
                .verticalDivision (on)
                    .row (r1)
                        .customBaseColumn (rn)
                            .dataviz-container (r1)
            .customBaseColumn (n)
                .row (1)
                    .customBaseColumn (n)
                        .dataviz-container (1)
                    .customBaseColumn
                        .verticalDivision (n)
                            .row (1)
                                .customBaseColumn (n)
                                    .dataviz-container (1)






    */

    class Bloc {
        constructor(columns) {
          this.divisions = [];
          this.totalContainers = 0;
        }

      }


    class Report {
        constructor() {
          this.structure = {
            title: "",
            blocs:[],
            definition: {}
        }
        this.configuration = {};
        this.theme =  "";
        }
    }

    var _getDivisions = function (element) {
        let results = {
            divisions: []
        };

        $(element).find(">.verticalDivision").each(function (id, verticalDivision) {
            let properties = {
                style: verticalDivision.className.replace("verticalDivisionlumn","").replace("lyrow","").trim(),
                childrens: $(verticalDivision).find(".customBaseColumn").parent()[0],
                type: "V"
            }
            results.divisions.push(properties);
        });

        $(element).find(">.customBaseColumn").each(function (id, baseColumn) {
            //check if maincolumn is divided or if contains container
            let properties = {
                style: "",
                isContainer: false,
                dataviz : false,
                childrens: false,
                type: "H"
            }
            properties.style = baseColumn.className.replace("customBaseColumn","").replace("dividedcolumn","").trim();

            if ($(baseColumn).find(">.dataviz-container").length > 0) {
                properties.isContainer = true;
                properties.dataviz = $(baseColumn).find(".dataviz").attr("data-dataviz") || false;
                properties.childrens = false;
            } else {
                properties.isContainer = false;
                if ($(baseColumn).find(">.verticalDivision,>.customBaseColumn").length > 0) {
                    properties.childrens = baseColumn;

                } else if ($(baseColumn).find(">.lyrow>.view>.row").length > 0) {
                    properties.childrens = $(baseColumn).find(">.lyrow>.view>.row")[0];
                } else {
                    properties.childrens = $(baseColumn).find(".customBaseColumn").parent()[0];
                }

            }
            results.divisions.push(properties)
        });

        return results;
    };

    _formula = function (b) {
        /*
         *   distibution = "|"
         *   colonne = "@"
         *   division verticale = "\"
         *   division horizontale = "/"
         *   Exemple1: @|@
         *  exemple 2 : @|@/2|@\2
         *
         */
        _pattern = new Array(b.divisions.length);
        b.divisions.forEach(function (d,index) {
            if (d.isContainer) {
            _pattern[index] = "@";
            } else if (d.divisions) {
                let _type = (d.divisions[0].type === "V")? "\\":"/";
                let _nb = d.divisions.length;
                _pattern[index] = "@" + _type + _nb;
            }

        })
        return _pattern.join("|");
    };

    var _saveJsonReport = function (composition, theme) {
        //Work in progress
        var xxx = new Report();
        //xxx.theme = theme || composer.activeModel().id;
        xxx.structure.title = $(composition).find(".report-bloc-title .dataviz-container>.dataviz").attr("data-dataviz");
        //Loop on blocs
        var blocs = [];
        $(composition).find(".report-bloc").each(function (id, bloc) {
            let _bloc = new Bloc();
            //count dataviz containers in Bloc
            _bloc.totalContainers =  $(bloc).find(".dataviz-container").length;
            let containersToFind = _bloc.totalContainers;
            //get columns level 1
            let level_1 = _getDivisions($(bloc).find(">.bloc-content>.row"));
            //Hack division from col-md-12
            if (level_1.divisions.length === 1 && !level_1.divisions[0].isContainer) {
                console.log(level_1);
                level_1.divisions = _getDivisions(level_1.divisions[0].childrens).divisions;
            }
            level_1.divisions.forEach(function(c) {
                if (c.isContainer) {
                    containersToFind -= 1;
                }
                if (c.childrens) {
                    c.divisions = _getDivisions(c.childrens).divisions;
                    c.divisions.forEach(function(c) {
                        if (c.isContainer) {
                            containersToFind -= 1;                        }
                        if (c.childrens) {
                            c.divisions = _getDivisions(c.childrens).divisions;
                            c.divisions.forEach(function(c) {
                                if (c.isContainer) {
                                    containersToFind -= 1;
                                }
                                if (c.childrens) {
                                    var level_4 = _getDivisions(c.childrens);
                                    level_4.divisions.forEach(function(c) {
                                        if (c.isContainer) {
                                            containersToFind -= 1;
                                        }
                                    })
                                }
                                delete c.childrens;
                            })
                        }
                        delete c.childrens;
                    });
                    delete c.childrens;
                } else {
                    _bloc.divisions = level_1.divisions;
                }
                delete c.childrens;
            });

            //_bloc.formula = _formula(_bloc);
            blocs.push(_bloc);

        });
        xxx.structure.blocs = blocs;

        _createDefinition(xxx);
        console.log(composer.templates.blockTemplate);


    };

    var _createDefinition = function (report) {
        console.log(report);
        report.structure.blocs.forEach(function(bloc) {
            console.log(bloc);
        });
    }

    var _composition2json = function (document_url) {

        $.ajax({
            url: document_url,
            dataType: "text",
            success: function (html) {
               var _html = $('<div id="report-composition"></div>').append(html)[0];
               console.log(_html);
               _saveJsonReport(_html);
            }
        });
    };

    var _formula2HTML = function (formula) {
        /* example with
            @
            @\2
            @|@\2
            @|@\2|@/2
        */

    }

    var _test = function () {
        let bloc = {
            properties: {
                "0_0": {
                    w: 4,
                    division_type: "H",
                    dataviz: {
                        id: "dvz1",
                        options: {}
                    }
                },
                "1_0": {
                    w: 4,
                    division_type: "H",
                },
                "1_1": {
                    w: 12,
                    division_type: "V",
                    dataviz: {
                        id: "dvz2",
                        options: {}
                    }
                },
                "1_2": {
                    w: 12,
                    division_type: "V",
                    dataviz: {
                        id: "dvz3",
                        options: {}
                    }
                },
                "2_0": {
                    w: 4,
                    division_type: "H"
                },
                "2_1": {
                    w: 6,
                    division_type: "H",
                    dataviz: {
                        id: "dvz4",
                        options: {}
                    }
                },
                "2_2": {
                    w: 6,
                    division_type: "H",
                    dataviz: {
                        id: "dvz1",
                        options: {}
                    }
                }
            }
        };


        _createBlocStructure(bloc.properties);


    };

    var _createBlocStructure = function (bloc_properties) {
        let tpls = {
            "B": '<div class="report-bloc"></div>',
            "R": '<div class="customBaseColumn col-md-{{w}}"></div>',
            "H": '<div class="customBaseColumn col-md-{{w}}"></div>',
            "V": '<div class="h-50 verticalDivision"><div class="customBaseColumn col-md-{{w}}"></div></div>'
        }

        //Get number of root cells
        let parts = [];
        let indexes = [];
        //Get number of root cells (0_0, 1_0...)
        Object.keys(bloc_properties).forEach(function (key) {
            if (key.match(/_0$/)) { indexes.push(key.split("_0")[0]); }
        });
        var parser = new DOMParser();
        indexes.forEach(function (index) {
            //get first level
            let parent = bloc_properties[`${index}_0`];
            let childElements = [];
            let parentElement =  parser.parseFromString(tpls["R"].replace("{{w}}", parent.w), "text/html").querySelector(".customBaseColumn");
            //Extract second level for index cell 1-1, 1_2 ...
            for (const [key, properties] of Object.entries(bloc_properties)) {
                const matcher = new RegExp(`^${index}_[1-4]{1}$`);
                if ( matcher.test(key) ) {
                    childElements.push(parser.parseFromString(tpls[properties.division_type].replace("{{w}}", properties.w), "text/html").querySelector("div"));
                }
            }
            childElements.forEach(function(child) {
                parentElement.append(child);
            });
            parts.push(parentElement);
        });
        // create response
        let blocElement =  parser.parseFromString(tpls["B"], "text/html").querySelector(".report-bloc");
        parts.forEach(function (part) {
            blocElement.append(part);
        });
        console.log(blocElement);


    };


    var _json2composition = function (report) {
        report.structure.blocs.forEach(function(bloc, index) {
            //each bloc
            console.log("Bloc " + index);
            bloc.divisions.forEach(function(division) {
                //first level
                console.log(division.style, division.isContainer);
            });
        });

    };

    /*
     * Public
     */

    return {
        saveJsonReport: _saveJsonReport,
        composition2json: _composition2json,
        Report2composition: _json2composition,
        test: _test


    }; // fin return

})();