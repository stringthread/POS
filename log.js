var xhr=new XMLHttpRequest();
var mode=0;
var deco,serial;
var container,subtitle;
const M_DECO=1;
const M_SERIAL=2;
var init=function(){
  subtitle=document.getElementById("subtitle");
  container=document.getElementById("container");
  switch(mode){
    case 0:
    subtitle.innerHTML="種別選択";
    container.innerHTML="<div id=\"deco_select\"><input type=\"text\" id=\"deco_code\"><button onclick=\"log_deco();\">デコ別記録</button></div><div id=\"serial_select\"><input type=\"text\" id=\"serial\"><button onclick=\"log_serial();\">番号から</button></div>";
    break;
    case M_DECO:
    subtitle.innerHTML="デコ別記録";
    draw_from_deco();
    break;
    case M_SERIAL:
    subtitle.innerHTML="番号から";
    draw_from_serial();
    break;
  }
};
var log_deco=function(){
  if(document.getElementById("deco_code").value){
    mode=M_DECO;
    deco=document.getElementById("deco_code").value;
    init();
  }
};
var log_serial=function(){
  if(document.getElementById("serial")){
    mode=M_SERIAL;
    serial=document.getElementById("serial").value;
    if(!isFinite(serial)){
      serial=0;
      document.getElementById("serial").value="";
      return;
    }
    init();
  };
}
var draw_from_deco=function(){
  if(deco in deco_table){
    xhr.open("POST","./database.php");
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.send("mode=log_deco&deco="+deco);
    xhr.onreadystatechange=function(){
      if(xhr.readyState==4){
        if(xhr.responseText==0){
          container.innerHTML=deco_table[deco][1]+" : 該当なし";
          return;
        }
        if(xhr.responseText==-1){
          container.innerHTML="エラーが発生しました";
          return;
        }
        var res_arr=JSON.parse(xhr.responseText);
        var tmp_str="<div id=\"table\">";
        for (var key in res_arr) {
          res_arr[key]['item']=JSON.parse(res_arr[key]['item']);
          tmp_str+="<div class=\"row\"><div class=\"id\">";
          tmp_str+=res_arr[key]['id'];
          tmp_str+="</div><div class=\"item_set\">";
          for(var k2 in res_arr[key]['item']){
            tmp_str+="<div class=\"item\">";
            tmp_str+="<div class=\"name\">";
            tmp_str+=item_table[item_barcode[res_arr[key]['item'][k2][0]]][1];
            tmp_str+="</div><div class=\"num\">";
            tmp_str+=res_arr[key]['item'][k2][1];
            tmp_str+="</div></div>";
          }
          tmp_str+="</div><div class=\"date\">";
          tmp_str+=res_arr[key]['date'];
          tmp_str+="</div></div>";
        }
        tmp_str+="</div>";
        container.innerHTML=tmp_str;
      }
    };
  }else{
    container.innerHTML="エラー : バーコードが間違っています。やり直してください";
  }
};
var draw_from_serial=function(){
  xhr.open("POST","./database.php");
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.send("mode=log_serial&serial="+serial);
  xhr.onreadystatechange=function(){
    if(xhr.readyState==4){
      if(xhr.responseText==0){
        container.innerHTML=serial+" : 該当なし";
        return;
      }
      if(xhr.responseText==-1){
        container.innerHTML="エラーが発生しました";
        return;
      }
      var res_arr=JSON.parse(xhr.responseText);
      res_arr['item']=JSON.parse(res_arr['item']);
      var tmp_str="<div id=\"table;\">";
      tmp_str+="<div class=\"row\">";
      tmp_str+="<div class=\"deco\">";
      tmp_str+=deco_table[res_arr['deco']][1];
      tmp_str+="</div>";
      for (var key in res_arr['item']){
        tmp_str+="<div class=\"item\">";
        tmp_str+="<div class=\"name\">";
        tmp_str+=item_table[item_barcode[res_arr['item'][key][0]]][1];
        tmp_str+="</div><div class=\"num\">";
        tmp_str+=res_arr['item'][key][1];
        tmp_str+="</div></div>"
      }
      tmp_str+="</div></div><div class=\"date\">";
      tmp_str+=res_arr['date'];
      tmp_str+="</div></div>";
      container.innerHTML=tmp_str;
    }
  };
};
window.onload=init;
