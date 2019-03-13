<?php
   include("/var/php-secure/db-settings.php");
   header('Content-Type: application/json');
   if (empty($_GET['dataid']) or strlen($_GET['dataid']) > 9) {
       echo json_encode(array());
       return;
    }

    $dataid = $_GET['dataid'];    
   
    $db = pg_connect($db_territoires);
    unset ($db_territoires);
     if (!$db) {
         echo "Connexion à la Base Impossible avec les paramètres fournis";
         die();
     }
     
    $ps = pg_prepare($db, "mreport_territoires", "SELECT * FROM indicateur._all WHERE dataid = $1 order by dataviz,dataset,\"order\"");
    
    $query = pg_execute($db, "mreport_territoires", array($dataid));

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