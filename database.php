<?php
mysqli_report(MYSQLI_REPORT_ERROR||MYSQLI_REPORT_STRICT);
define('DBHOST','localhost');
define('DBUSER','POS');
define('DBPASS','qwerty');
define('DBNAME','pos');
header('Content-type:text/plain');
try{
  $db=new mysqli(DBHOST,DBUSER,DBPASS,DBNAME);
  switch($_POST['mode']){
    case 'serial':
    $result=$db->query('SELECT id FROM log ORDER BY id LIMIT 1;');
    if($result->num_rows!=0)echo $result->fetch_row()[0]+1;
    else echo 1;
    break;
    case 'deal':
    if(array_key_exists('item',$_POST)){
      $stmt=$db->prepare("INSERT INTO log (id,item) VALUES (?,?);");
      $stmt->bind_param('is',$_POST['serial'],$_POST['item']);
      $stmt->execute();
      echo 0;
    }else echo -1;
    break;
  }
  exit;
}catch(Exception $e){
  echo -1;
  exit;
}
?>
