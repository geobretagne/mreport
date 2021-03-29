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

    /*

    pour tester l'encodage json, lancer dans la console : saver.composition2json("/mreport/epci_population/report_composer.html")
    pour tester la reconstruction html, lancer : saver.test()

    */

    class Bloc {
        constructor(columns) {
          this.divisions = [];
          this.totalContainers = 0;
          this.definition = {};
          this.sources = "";
          this.title = {};
        }

      }


    class Report {
        constructor() {
          this.structure = {
            title: "",
            blocs:[]
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


    var _saveJsonReport = function (composition, theme) {
        //Work in progress
        var xxx = new Report();
        //xxx.theme = theme || composer.activeModel().id;
        xxx.structure.title = $(composition).find(".report-bloc-title .dataviz-container>.dataviz").attr("data-dataviz");
        //Loop on blocs
        var blocs = [];
        $(composition).find(".report-bloc").each(function (blocidx, bloc) {
            let _bloc = new Bloc();
            //count dataviz containers in Bloc
            _bloc.totalContainers =  $(bloc).find(".dataviz-container").length;
            let containersToFind = _bloc.totalContainers;
            //get bloc-sources if present
            let title = bloc.querySelector(".bloc-title.editable-text");
            if (title && title.firstChild && title.firstChild.nodeType === 3 && title.firstChild.textContent) {
                let style = false;
                if (title.className.match(/titre-\d/)) {
                    style = title.className.match(/titre-\d/)[0];
                }
                _bloc.title = { "title": title.firstChild.textContent.trim(), "style": style };
            }
            //get bloc-sources if present
            let sources = bloc.querySelector(".bloc-sources .editable-text");
            if (sources && sources.firstChild && sources.firstChild.nodeType === 3 && sources.firstChild.textContent) {
                _bloc.sources = sources.firstChild.textContent.trim();
            }

            //get columns first level of bloc-content
            let level_1 = _getDivisions($(bloc).find(">.bloc-content>.row"));
            //Hack division from col-md-12
            if (level_1.divisions.length === 1 && !level_1.divisions[0].isContainer) {
                level_1.divisions = _getDivisions(level_1.divisions[0].childrens).divisions;
            }
            level_1.divisions.forEach(function(c, divisionidx) {
                if (c.isContainer) {
                    containersToFind -= 1;
                }
                if (c.childrens) {
                    c.divisions = _getDivisions(c.childrens).divisions;
                    c.divisions.forEach(function(c, divisionidx) {
                        if (c.isContainer) {
                            containersToFind -= 1;
                        }
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

            _setBlocDefinition(_bloc);
            blocs.push(_bloc);

        });
        xxx.structure.blocs = blocs;

        $(composition).find("code.dataviz-definition").each(function (idx, definition) {
            let parser = new DOMParser();
            let datavizid = definition.parentElement.dataset.dataviz;
            if (datavizid) {
                let properties = false;
                if (definition.textContent) {
                    properties = parser.parseFromString(definition.textContent, "text/html").querySelector(".dataviz").dataset;
                }
                let configuration = {
                    dataviz: datavizid,
                    properties: properties
                };
                xxx.configuration[datavizid] = configuration;
            }

        });




        console.log(xxx);
        //test html reconstruction
        let structure = [];
        xxx.structure.blocs.forEach(function (bloc) {
            structure.push(_createBlocStructure(bloc.definition));
        });
        console.log(structure.map(e => e.innerHTML).join(""));



        console.log(composer.templates.blockTemplate);


    };


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

    _setBlocDefinition = function (bloc) {
        //Get first level
        bloc.divisions.forEach(function (div0, div0idx) {
            let properties0 = {"w":div0.style.replace( /^\D+/g, ''), "division_type":div0.type};
            if (div0.dataviz) {
                properties0.dataviz =  { id: div0.dataviz, options: {} };
            } else if (div0.isContainer) {
                properties0.dataviz = false;
            }
            bloc.definition[`${div0idx}_0`] = properties0;
            //Get next level
            if (!div0.isContainer && div0.divisions) {
                div0.divisions.forEach(function (div1,div1idx) {
                    let properties1 = {"w":"", "division_type":div1.type};
                    if (div1.type === "H") {
                        properties1.w = div1.style.replace( /\D+/g, '');
                    } else {
                        //vertical div
                        properties1.h = div1.style.replace( /\D+/g, '');
                        //get subdivisions
                        if (!div1.isContainer && div1.divisions) {
                            div1.divisions.forEach(function (div11,div11idx) {
                                //properties1 = {"w":"", "division_type":div1.type};
                                if (div11.type === "H") {
                                    properties1.w = div11.style.replace( /\D+/g, '');
                                }
                                if (div1.type === 'V') {
                                    properties1.h = div1.style.replace( /\D+/g, '');
                                }
                                if (div11.dataviz) {
                                    properties1.dataviz =  { id: div11.dataviz, options: {} };
                                } else if (div11.isContainer) {
                                    properties1.dataviz = false;
                                }
                            });
                        }
                    }
                    if (div1.dataviz) {
                        properties1.dataviz =  { id: div1.dataviz, options: {} };
                    } else if (div1.isContainer) {
                        properties1.dataviz = false;
                    }
                    bloc.definition[`${div0idx}_${div1idx + 1}`] = properties1;

                });
            }
        });
    }


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
        return blocElement;


    };


    var _json2composition = function (report) {


    };

    /*
     * Public
     */

    return {
        saveJsonReport: _saveJsonReport,
        composition2json: _composition2json,
        Report2composition: _json2composition


    }; // fin return

})();