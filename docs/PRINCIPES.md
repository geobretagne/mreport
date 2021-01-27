### PRINCIPE

Each report stored in mviewer/reports is a folder containing :

* Required `config.json` which is the configuration file
* Required `report.html` which is the html strutured document to render report
if dataviz options are both defined in report.html with data-attributes and in config.json, configuration.json will overwrite html configuration.
each dataviz option can be defined in config.json or in report.html with the same parameter. Eg:


`{
"charts": [
{
"id": "chart1",
"label": "soldes",
"opacity": 0.5,
"type": "bar",
"colors":[#00b894]
}
]
}`


`<div id="chart1" class="report-chart" data-type="bar" data-opacity="0.5" data-label="soldes" data-colors="#00b894" ></div>`


**config.json optional parameters**

`{
"title": {"id": "mytitle"},
"charts": [{"id": "chart1", "label": "mychart", "type": "bar"}],
"tables": [{"id": "table1", "label": "column1,column2"}],
"figures": [{"id": "fig1"}]
}`