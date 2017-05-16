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
      $stmt=$db->prepare("INSERT INTO log (id,deco,item) VALUES (?,?,?);");
      $stmt->bind_param('iis',$_POST['serial'],$_POST['deco'],$_POST['item']);
      $stmt->execute();
      echo 0;
    }else echo -1;
    break;
    case 'log_deco':
    $stmt=$db->prepare('SELECT id,item,date FROM log WHERE deco=?;');
    $stmt->bind_param('i',$_POST['deco']);
    $stmt->execute();
    $result=$stmt->get_result();
    if($result->num_rows==0){
      echo json_encode([-1,-1,'']);
      $stmt->close();
      break;
    }
    $res=array();
    for($i=0;$tmp=$result->fetch_assoc();$i++){
      $res[$i]=$tmp;
    }
    echo json_encode($res);
    $stmt->close();
    break;
    case 'log_serial':
    $stmt=$db->prepare("SELECT deco,item,date FROM log WHERE id=?;");
    $stmt->bind_param('i',$_POST['serial']);
    $stmt->execute();
    $result=$stmt->get_result();
    if($result->num_rows==0){
      echo json_encode([-1,-1,'']);
      $stmt->close();
      break;
    }
    $res=$result->fetch_assoc();
//    $res['date']=date('Y/m/d',$res['date']);
    echo json_encode($res);
    $stmt->close();
    break;
  }
  exit;
}catch(Exception $e){
  echo -1;
  exit;
}
?>
