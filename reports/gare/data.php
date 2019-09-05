<?php
   include("/var/php-secure/db-settings.php");
   header('Content-Type: application/json');
   
    $dataid = $_GET['dataid'];
    $params = array($dataid);

    $db = pg_connect($db_territoires);
    unset ($db_territoires);
     if (!$db) {
         echo json_encode(array("Connexion à la Base Impossible avec les paramètres fournis"));
         die();
     }

     $sql = "SELECT * FROM indicateur.gare WHERE dataid = $1 order by dataviz,dataset,\"order\"";
     
     if (empty($_GET['dataid'])) {
       $sql = "SELECT distinct dataid FROM indicateur.gare";
       $params = [];
    }




    $ps = pg_prepare($db, "mreport_gare", $sql);

    $query = pg_execute($db, "mreport_gare", $params);

    if (!$query ) {
        echo  json_encode(pg_last_error($db));
         die();
    }
    echo json_encode(pg_fetch_all ($query));
    // free memory
    pg_free_result($query);
    // close connection
     if (!$db) {
        pg_close($db);
     }

?>