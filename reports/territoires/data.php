<?php
   include("/var/php-secure/db-settings.php");
   header('Content-Type: application/json');
   if (empty($_GET['dataid']) or strlen($_GET['dataid']) > 9) {
       echo json_encode([['dataid' => '242900314'],['dataid' => '200027027']]);
       return;
    }

    $dataid = $_GET['dataid'];

    $params = array($dataid);

    $db = pg_connect($db_territoires);

    unset ($db_territoires);
     if (!$db) {
         echo json_encode(array("Connexion à la Base Impossible avec les paramètres fournis"));
         die();
     }

     $sql = "SELECT * FROM indicateur._all WHERE dataid = $1 order by dataviz,dataset,\"order\"";



    $ps = pg_prepare($db, "mreport_territoires", $sql);

    $query = pg_execute($db, "mreport_territoires", $params);

    if (!$query ) {
        echo  json_encode(pg_last_error($db));
         die();
    }
    echo json_encode(pg_fetch_all ($query));
    // free memory
    pg_free_result($query);
    // close connection
     if ($db) {
        pg_close($db);
     }

?>