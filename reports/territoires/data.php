<?php
   include("/var/php-secure/db-settings.php");
   header('Content-Type: application/json');
   if (empty($_GET['dataid'])) {
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

    $sql = "SELECT * FROM observation.tb_all WHERE dataid='$dataid' order by dataviz,dataset,\"order\";";

    $query = pg_query($db, $sql);

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