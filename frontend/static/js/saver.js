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
    pour tester la reconstruction html, lancer : saver.Report2composition()

    */

    class Bloc {
        constructor() {
          this.divisions = [];
          this.definition = {};
          this.sources = "";
          this.title = {};
          this.type = "Bloc";
        }

      }

      class BlocElement {
        constructor(text, style) {
          this.text = text;
          this.style = style;
          this.type = "BlocElement";
        }

      }

      class BlocTitle {
        constructor(datavizid) {
          this.title = datavizid;
          this.type = "BlocTitle";
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

        element.querySelectorAll(":scope > .verticalDivision").forEach(function(verticalDivision) {
            let properties = {
                style: verticalDivision.className.replace("verticalDivisionlumn","").replace("lyrow","").trim(),
                childrens: verticalDivision.querySelector(".customBaseColumn").parentElement,
                type: "V"
            }
            results.divisions.push(properties);
        });

        element.querySelectorAll(":scope > .customBaseColumn").forEach(function(baseColumn) {
            //check if maincolumn is divided or if contains container
            let properties = {
                style: "",
                isContainer: false,
                dataviz : false,
                childrens: false,
                type: "H"
            }
            properties.style = baseColumn.className.replace("customBaseColumn","").replace("dividedcolumn","").trim();

            if (baseColumn.querySelectorAll(":scope > .dataviz-container").length > 0) {
                properties.isContainer = true;
                properties.dataviz = baseColumn.querySelector(".dataviz").dataset.dataviz || false;
                properties.childrens = false;
            } else {
                properties.isContainer = false;
                if (baseColumn.querySelectorAll(".verticalDivision, .customBaseColumn").length > 0) {
                    properties.childrens = baseColumn;
                } else if (baseColumn.querySelectorAll(":scope > .lyrow>.view>.row").length > 0) {
                    properties.childrens = baseColumn.querySelector(":scope > .lyrow>.view>.row");
                } else {
                    properties.childrens = baseColumn.querySelector(".customBaseColumn").parentElement;
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
        //Loop on blocs
        var blocs = [];
        composition.querySelectorAll("#report-composition > .list-group-item").forEach(function (bloc_item, blocidx) {
            let bloc_type = bloc_item.className.match(/structure-*(bloc|element)/)[1];
            if (bloc_type === "bloc") {
                //report-bloc
                let bloc = bloc_item.querySelector(".report-bloc");
                if (bloc) {
                    let _bloc = new Bloc();
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
                    let level_1 = _getDivisions(bloc.querySelector("div > .bloc-content > .row"));
                    //Hack division from col-md-12
                    if (level_1.divisions.length === 1 && !level_1.divisions[0].isContainer) {
                        level_1.divisions = _getDivisions(level_1.divisions[0].childrens).divisions;
                    }
                    level_1.divisions.forEach(function(c, divisionidx) {
                        if (c.childrens) {
                            c.divisions = _getDivisions(c.childrens).divisions;
                            c.divisions.forEach(function(c, divisionidx) {
                                if (c.childrens) {
                                    c.divisions = _getDivisions(c.childrens).divisions;
                                    c.divisions.forEach(function(c) {
                                        if (c.childrens) {
                                            var level_4 = _getDivisions(c.childrens);
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
                } else {
                    // bloc-title
                    let bloc = bloc_item.querySelector(".report-bloc-title");
                    if (bloc) {
                        let dataviz = bloc.querySelector(".dataviz");
                        if (dataviz && dataviz.dataset && dataviz.dataset.dataviz) {
                            blocs.push(new BlocTitle(dataviz.dataset.dataviz));
                        }

                    }

                }




            } else {
                if (bloc_item.classList.contains("titleBloc")) {
                    let t = bloc_item.querySelector(".editable-text");
                    if (t && t.firstChild && t.firstChild.nodeType === 3 && t.firstChild.textContent) {
                        let style = false;
                        if (t.className.match(/titre-\d/)) {
                            style = t.className.match(/titre-\d/)[0];
                        }
                        blocs.push(new BlocElement(t.firstChild.textContent.trim(), style));
                    }
                }

            }

        })

        xxx.structure.blocs = blocs;

        composition.querySelectorAll("code.dataviz-definition").forEach(function (definition) {
            let parser = new DOMParser();
            let datavizid = definition.parentElement.dataset.dataviz;
            if (datavizid) {
                let properties = false;
                if (definition.textContent) {
                    let dvz_element = parser.parseFromString(definition.textContent, "text/html").querySelector(".dataviz");
                    properties = dvz_element.dataset;
                    properties.dataviz_class = dvz_element.className.match(/report-*(chart|figure|text|table|map|title|image|iframe)/)[1];
                }
                xxx.configuration[datavizid] = properties;
            }

        });




        console.log('Objet Report créé à partir de la page composition : ', xxx);
        let report = {
            dataviz_configuration: xxx.configuration,
            structure: {
                blocs: xxx.structure.blocs.map(function(b) {
                    let result = {};
                    switch (b.type) {
                        case "BlocElement":
                            result = {text: b.text, style: b.style};
                            break;
                        case "BlocTitle":
                            result = {title: b.title};
                            break;
                        case "Bloc":
                            result = { layout: b.definition, sources: b.sources, title: b.title };
                            break;
                    }
                    result.type = b.type;
                    return result;

                })
            },
            theme: xxx.theme
        }

        console.log(report,JSON.stringify(report));
        //test html reconstruction
        let structure = [];
        xxx.structure.blocs.forEach(function (bloc) {
            if (bloc.type === "Bloc") {
                structure.push(_createBlocStructure(bloc.definition));
            } else if (bloc.type === "BlocElement") {
                console.log("TODO");
            }

        });
        console.log("Contenu html fabriqué à partir de l'objet Report : ", structure.map(e => e.innerHTML).join(""));



        //console.log(composer.templates.blockTemplate);


    };


    var _composition2json = function (document_url) {

        $.ajax({
            url: document_url,
            dataType: "text",
            success: function (html) {
                let _html = document.createElement("div");
                _html.id = "report-composition";
                _html.innerHTML = html;
                console.log('Contenu récupéré à traiter : ', _html);
                _saveJsonReport(_html);
            }
        });
    };

    _setBlocDefinition = function (bloc) {
        //Get first level
        bloc.divisions.forEach(function (div0, div0idx) {
            let properties0 = {"w":div0.style.replace( /^\D+/g, ''), "division_type":div0.type};
            if (div0.dataviz) {
                properties0.dataviz =  div0.dataviz;
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
                                    properties1.dataviz =  div11.dataviz;
                                } else if (div11.isContainer) {
                                    properties1.dataviz = false;
                                }
                            });
                        }
                    }
                    if (div1.dataviz) {
                        properties1.dataviz =  div1.dataviz;
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

        let jsonReport = "";

        if (!report) {
            // config test
            jsonReport = `{"configuration":{"epci_title":{"dataviz_class":"title"},"epci_pop_en_cours":{"model":"b","icon":"icon-blue-habitants","iconposition":"custom-icon","dataviz_class":"figure"},"epci_pop_densite_en_cours":{"model":"b","unit":" hab/km²","icon":"icon-blue-densite2","iconposition":"custom-icon","title":"","description":"","dataviz_class":"figure"},"epci_pop_evolution":{"title":"Evolution nombre d'habitant·e·s dans l'EPCI","description":"","model":"b","type":"line","label":"Légende","colors":"#005a66","opacity":"0.2","ratio":"2:1","stacked":"false","begin0":"true","hidelegend":"true","showlabels":"false","dataviz_class":"chart"},"epci_pop_comparaison_pays_region":{"title":"Taux d'évolution de la population municipale comparée de 2012 à 2017","description":"","model":"b","type":"bar","label":"Légende","colors":"#0094ab,#005a66,#005a66","opacity":"1","ratio":"2:1","stacked":"false","begin0":"true","hidelegend":"true","showlabels":"false","dataviz_class":"chart"},"epci_pop_repartition_f_en_cours":{"model":"b","unit":" %","icon":"icon-blue-femme","iconposition":"custom-icon","dataviz_class":"figure"},"epci_pop_repartition_h_en_cours":{"model":"b","unit":" %","icon":"icon-blue-homme","iconposition":"custom-icon","dataviz_class":"figure"},"epci_pop_categorie_age_en_cours":{"title":"Répartition de la population selon la classe d'âge en 2017","description":"","model":"b","label":"EPCI,Région","colors":"#0094ab,#005a66","opacity":"1","ratio":"2:1","stacked":"false","begin0":"true","hidelegend":"false","showlabels":"false","dataviz_class":"chart"},"epci_pop_categorie_csp_en_cours":{"title":"Répartition de la population selon les catégories socio-professionnelles (CSP) en 2017","description":"<ul>Les catégories socio-professionnelles<li>CS1: Agriculteur·rice·s exploitants </li><li>CS2: Artisan·e·s, Commerçant·e·s, Chef·fe·s d'entreprise</li><li>CS3: Cadres, Professions intellectuelles supérieures </li><li>CS4: Professions intermédiaires</li><li>CS5: Employé·e·s </li><li>CS6: Ouvrier·ère·s </li><li>CS7: Retraité·e·s </li><li>CS8: Autres, Sans activité professionnelle</li></ul>","model":"b","label":"EPCI,Région","colors":"#0094ab,#005a66","opacity":"1","ratio":"2:1","stacked":"false","begin0":"true","hidelegend":"false","showlabels":"false","dataviz_class":"chart"},"epci_pop_menage_famillemono_en_cours":{"model":"b","unit":" %","icon":"icon-blue-menage_mono","iconposition":"custom-icon","dataviz_class":"figure"},"epci_revenu_median":{"model":"b","unit":" €","icon":"icon-blue-revenu","iconposition":"custom-icon","dataviz_class":"figure"},"epci_revenu_taux_pauvrete":{"model":"b","unit":" %","icon":"icon-blue-social_tx_pauvrete","iconposition":"custom-icon","dataviz_class":"figure"},"epci_pop_formation_sans_diplome_en_cours":{"model":"b","unit":" %","icon":"icon-blue-social_diplome","iconposition":"custom-icon","dataviz_class":"figure"},"epci_pop_logement_statut_en_cours":{"title":"Répartition des logements selon le statut en 2017","description":"","model":"b","type":"bar","label":"EPCI,Région","colors":"#0094ab,#005a66","opacity":"1","ratio":"3:2","stacked":"false","begin0":"true","hidelegend":"false","showlabels":"false","dataviz_class":"chart"},"epci_pop_logement_type_en_cours":{"title":"Répartition des logements selon le type en 2017","description":"","model":"b","type":"pie","label":"Légende","colors":"#0094ab,#005a66","opacity":"1","ratio":"3:2","stacked":"false","begin0":"false","hidelegend":"false","showlabels":"true","dataviz_class":"chart"},"epci_pop_logement_nb_personne_en_cours":{"model":"b","icon":"icon-yellow-house_person","iconposition":"custom-icon","dataviz_class":"figure"},"epci_pop_logement_hlm_taux_en_cours":{"model":"b","unit":" %","icon":"icon-yellow-hlm_tx","iconposition":"custom-icon","dataviz_class":"figure"}},"structure":{"blocs":[{"title":"epci_title","type":"BlocTitle"},{"text":"La population du territoire","style":"titre-1","type":"BlocElement"},{"layout":{"0_0":{"w":"4","division_type":"H"},"0_1":{"w":"12","division_type":"V","h":"50","dataviz":"epci_pop_en_cours"},"0_2":{"w":"12","division_type":"V","h":"50","dataviz":"epci_pop_densite_en_cours"},"1_0":{"w":"4","division_type":"H","dataviz":"epci_pop_evolution"},"2_0":{"w":"4","division_type":"H","dataviz":"epci_pop_comparaison_pays_region"}},"sources":"SOURCE: INSEE publication 2020","title":{"title":"Démographie","style":"titre-2"},"type":"Bloc"},{"layout":{"0_0":{"w":"6","division_type":"H"},"0_1":{"w":"12","division_type":"V","h":"50","dataviz":"epci_pop_repartition_f_en_cours"},"0_2":{"w":"12","division_type":"V","h":"50","dataviz":"epci_pop_repartition_h_en_cours"},"1_0":{"w":"6","division_type":"H","dataviz":"epci_pop_categorie_age_en_cours"}},"sources":"SOURCE: INSEE publication 2020","title":{},"type":"Bloc"},{"layout":{"0_0":{"w":"6","division_type":"H","dataviz":"epci_pop_categorie_csp_en_cours"},"1_0":{"w":"6","division_type":"H","dataviz":"epci_pop_menage_famillemono_en_cours"}},"sources":"SOURCE: INSEE publication 2020","title":{},"type":"Bloc"},{"layout":{"0_0":{"w":"6","division_type":"H","dataviz":"epci_revenu_median"},"1_0":{"w":"6","division_type":"H","dataviz":"epci_revenu_taux_pauvrete"}},"sources":"SOURCE: INSEE publication 2020","title":{"title":"Revenus","style":"titre-2"},"type":"Bloc"},{"layout":{"0_0":{"w":"12","division_type":"H","dataviz":"epci_pop_formation_sans_diplome_en_cours"}},"sources":"SOURCE: INSEE publication 2020","title":{"title":"Education","style":"titre-2"},"type":"Bloc"},{"layout":{"0_0":{"w":"4","division_type":"H","dataviz":"epci_pop_logement_statut_en_cours"},"1_0":{"w":"4","division_type":"H","dataviz":"epci_pop_logement_type_en_cours"},"2_0":{"w":"4","division_type":"H"},"2_1":{"w":"12","division_type":"V","h":"50","dataviz":"epci_pop_logement_nb_personne_en_cours"},"2_2":{"w":"12","division_type":"V","h":"50","dataviz":"epci_pop_logement_hlm_taux_en_cours"}},"sources":"SOURCE: INSEE publication 2020","title":{"title":"Logement","style":"titre-2"},"type":"Bloc"}]},"theme":""}`;
        } else {
            jsonReport = report;
        }
        let config = {};
        try {
            config = JSON.parse(jsonReport);
        } catch {
            console.log('le rapport au format json est illisible');
        }
        console.log(config);

    };

    /*
     * Public
     */

    return {
        saveJsonReport: _saveJsonReport,
        composition2json: _composition2json,
        report2composition: _json2composition


    }; // fin return

})();