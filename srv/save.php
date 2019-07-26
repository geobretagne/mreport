<?php

$report = $_GET['report'];
$html = file_get_contents('php://input');
$fichier = "../reports/" . $report ."/report.html";
header('Content-type: application/json',true);

$ret = file_put_contents($fichier, $html);

echo '{"success":' . $ret .'}'; 
  
?>