<?php
   include("/var/php-secure/db-settings.php");
   header('Content-Type: application/json');
   if (empty($_GET['ecluse'])) {
       echo json_encode(array());
       return;
    }

    $dataid = $_GET['ecluse'];

    $db = pg_connect($db_sig);
    unset ($db_sig);
     if (!$db) {
         echo "Connexion à la Base Impossible avec les paramètres fournis";
         die();
     }

    $ps = pg_prepare($db, "mreport_traffic", "SELECT chart as dataviz, ecluse as dataid, \"order\", data, label, unite, dataset FROM vn.chart_all WHERE ecluse = $1 order by chart,\"order\"");

    $query = pg_execute($db, "mreport_traffic", array($dataid));

      if (!$query ) {
        echo  pg_last_error($db);
         die();
     }

    echo json_encode(pg_fetch_all ($query));


     // free memory
    pg_free_result($query);
    // close connection
     if (!$dbh) {
        pg_close($dbh);
     }

?>