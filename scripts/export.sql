CREATE TEMPORARY TABLE bk AS SELECT report from data.report WHERE report IN (:expr);

copy (select report, title from data.report
	  where report IN (SELECT report from bk))
      To '/tmp/report.txt'  DELIMITER ';';
      
copy (select report, dataviz from data.report_composition
	  where report IN (SELECT report from bk))
      To '/tmp/report_composition.txt'  DELIMITER ';';

copy (select a.dataviz, a.title, a.description, a.source, a.year, a.unit, a.type, a.level, a.job, a.viz from data.dataviz a
	  JOIN data.report_composition  b 
	  ON a.dataviz = b.dataviz 
	  where report IN (SELECT report from bk))
	  To '/tmp/dataviz.txt'  DELIMITER ';';
      
copy (select a.dataviz, a.dataid, a.dataset, a.order, a.label, a.data from data.rawdata a
	  JOIN data.report_composition  b 
	  ON a.dataviz = b.dataviz 
	  where report IN (SELECT report from bk))
	  To '/tmp/rawdata.txt'  DELIMITER ';';
      
      
copy (select distinct c.level from data.level_type c
	  join data.dataviz a
	  JOIN data.report_composition  b 
	  ON a.dataviz = b.dataviz
	  On c.level = a.level
	  where report IN (SELECT report from bk))
      To '/tmp/level_type.txt'  DELIMITER ';';
      
copy (select distinct c.dataid, c.label, c.level from data.dataid c
	  join data.dataviz a
	  JOIN data.report_composition  b 
	  ON a.dataviz = b.dataviz
	  On c.level = a.level
	  where report IN (SELECT report from bk))
      To '/tmp/dataid.txt'  DELIMITER ';';
      
DROP TABLE IF EXISTS bk;
