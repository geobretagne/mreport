saver = (function () {
    /*
     * Private
     */
        var _saveJsonReport = function () {
        //Work in progress

        class Bloc {
            constructor(columns) {
              this.divisions = [];
              this.totalContainers = 0;
              this.formula = "";
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

        var _getCells = function (element) {
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

        var xxx = new Report();
        xxx.theme = composer.activeModel().id;
        xxx.structure.title = $("#report-composition .report-bloc-title .dataviz-container>.dataviz").attr("data-dataviz");
        //Loop on blocs
        var blocs = [];
        $("#report-composition .report-bloc").each(function (id, bloc) {
            let _bloc = new Bloc();
            //count dataviz containers in Bloc
            _bloc.totalContainers =  $(bloc).find(".dataviz-container").length;
            let containersToFind = _bloc.totalContainers;
            //get columns level 1
            let level_1 = _getCells($(bloc).find(">.bloc-content>.row"));
            level_1.divisions.forEach(function(c) {
                if (c.isContainer) {
                    containersToFind -= 1;
                }
                if (c.childrens) {
                    c.divisions = _getCells(c.childrens).divisions;
                    c.divisions.forEach(function(c) {
                        if (c.isContainer) {
                            containersToFind -= 1;                        }
                        if (c.childrens) {
                            c.divisions = _getCells(c.childrens).divisions;
                            c.divisions.forEach(function(c) {
                                if (c.isContainer) {
                                    containersToFind -= 1;
                                }
                                if (c.childrens) {
                                    var level_4 = _getCells(c.childrens);
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

            _bloc.formula = _formula(_bloc);
            blocs.push(_bloc);

        });
        xxx.structure.blocs = blocs;
        console.log ("Enregistrement JSON :")
        console.log(xxx);


    };
    
    /*
     * Public
     */

    return {
        saveJsonReport: _saveJsonReport

        
    }; // fin return

})();