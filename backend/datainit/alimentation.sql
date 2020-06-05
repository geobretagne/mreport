insert into schema.dataid (dataid, label) values
('ec_123', 'Ecluse de la malouinière');

insert into schema.report (report, title) values
('rapportsurlescluses', 'Rapport sur les écluses'),
('rapportsurlesponeys', 'Rapport sur les poneys');

insert into schema.dataviz (dataviz, title, description, source, year, "type", level) values
('ecl_passage_horaire', 'passage par plage horaire','Exemple de graphique','Région Bretagne', '2019', 'Histogramme', 'Ecluse'),
('ecl_descriptif', 'Descriptif de l''écluse','Exemple de texte','Région Bretagne', '2019', 'Texte', 'Ecluse'),
('ecl_passage_mensuel', 'passage par mois','Exemple de tableau','Région Bretagne', '2019', 'Tableau', 'Ecluse'),
('ecl_total_bateaux', 'passage par an','Exemple de chiffre clé','Région Bretagne', '2019', 'Chiffre clé', 'Ecluse'),
('ecl_map', 'Carte du mobilier','Exemple de carte','Région Bretagne', '2019', 'Carte', 'Ecluse'),
('ecl_photo', 'Photo de l''écluse','Exemple d''image','Région Bretagne', '2019', 'Image', 'Ecluse');


insert into schema.report_composition (report, dataviz) values
('rapportsurlescluses', 'ecl_passage_horaire'),
('rapportsurlescluses', 'ecl_descriptif'),
('rapportsurlescluses', 'ecl_passage_mensuel'),
('rapportsurlescluses', 'ecl_total_bateaux'),
('rapportsurlescluses', 'ecl_map'),
('rapportsurlescluses', 'ecl_photo'),
('rapportsurlesponeys', 'ecl_descriptif'),
('rapportsurlesponeys', 'ecl_passage_mensuel'),
('rapportsurlesponeys', 'ecl_total_bateaux');

insert into schema.rawdata (dataviz, dataid, dataset, "order", label, data) values
('ecl_passage_horaire','ec_123','passage',1,'9h-10h','28'),
('ecl_passage_horaire','ec_123','passage',2,'10h-11h','72'),
('ecl_passage_horaire','ec_123','passage',3,'11h-12h','81'),
('ecl_passage_horaire','ec_123','passage',4,'12h-13h','38'),
('ecl_passage_horaire','ec_123','passage',5,'13h-14h','16'),
('ecl_passage_horaire','ec_123','passage',6,'14h-15h','59'),
('ecl_passage_horaire','ec_123','passage',7,'15h-16h','53'),
('ecl_passage_horaire','ec_123','passage',8,'16h-17h','61'),
('ecl_passage_horaire','ec_123','passage',9,'17h-18h','45'),
('ecl_passage_horaire','ec_123','passage',10,'18h-19h','18'),
('ecl_passage_horaire','ec_123','passage',11,'19h-20h','1'),
('ecl_descriptif','ec_123','descriptif',1,'Descriptif','Lorem ipsum dolor sit amet. consectetur adipiscing elit. Ut id urna faucibus. blandit tellus a. aliquet massa. Vivamus non mollis arcu. Phasellus nec sem eget massa fa...'),
('ecl_passage_mensuel','ec_123','mois',1,'Mois','Janvier'),
('ecl_passage_mensuel','ec_123','mois',2,'Mois','Février'),
('ecl_passage_mensuel','ec_123','mois',3,'Mois','Mars'),
('ecl_passage_mensuel','ec_123','passage',1,'Passage','12'),
('ecl_passage_mensuel','ec_123','passage',2,'Passage','22'),
('ecl_passage_mensuel','ec_123','passage',3,'Passage','222'),
('ecl_total_bateaux', 'ec_123',	'nb_bateaux',0,	'Nombre total de passage de bâteaux', '443'),
('ecl_map', 'ec_123', 'mobilier', 1,	'Table a', 'POINT(-1.5, 48.2)'),
('ecl_map', 'ec_123', 'mobilier', 2,	'Tableau b', 'POINT(-1.55, 48.25)'),
('ecl_photo', 'ec_123',	'image', 1, 'Image de l''écluse','http://kartenn.region-bretagne.fr/img/vn/ecluse/ECL_IR33.jpg');




