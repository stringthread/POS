var mode=0;
var container;
var deco=0;
var serial=0;
var item=[[0,"",0,0,0]];
var tmp_int=0;
var tmp_arr=[0,"",0,0,0];
var is_barcode=false;
var ctr=0;
var total=0;
const ID_BARCODE=";";

var deco_table={
  123:[0,"1-1"],
  124:[1,"1-2"]
};

var item_table={
  123456789:["test",300],
  987654321:["test2",500]
};

window.onload=function(){init();};

var init=function(){
  container=document.getElementById('container');
  tmp_int=0;
  tmp_arr=[0,"",0,0,0];
  is_barcode=false;
  if(deco)document.getElementById("deco").innerHTML=deco_table[deco][1];
  else document.getElementById("deco").innerHTML="";
  document.addEventListener('keydown',function(e){
    if(e.shiftKey&&e.key=="Enter"){
      next();
    }
    if(e.key=="Escape"){
      mode--;
      if(mode<=0)document.Location.reload();
      init();
    }
  });
  switch(mode){
    case 0:
    container.innerHTML="<h2>デコ選択</h2><div class=\"input\" id=\"deco_input\"></div>";
    document.getElementById("method").innerHTML="Shift+Enterで次の画面<br>Escapeでリセット";
    document.getElementById("receipt").innerHTML="";
    document.addEventListener('keydown',deco_input);
    break;
    case 1:
    container.innerHTML="<h2>商品入力</h2><div id=\"item_container\"></div>";
    document.getElementById("method").innerHTML="Shift+Enterで次の画面<br>Escapeで前の画面<br>Backspaceで入力文字を1桁消去<br><br>商品のバーコードを読み込んだ後、数字キーで個数を入力";
    document.getElementById("receipt").innerHTML="";
    document.removeEventListener('keydown',deco_input);
    document.addEventListener('keydown',item_input);
    break;
    case 2:
    container.innerHTML="<h2>商品確認</h2><div id=\"item_container\"></div>";
    document.getElementById("method").innerHTML="Shift+Enterで確定<br>Escapeで前の画面";
    document.getElementById("receipt").innerHTML="";
    item_draw();
    document.removeEventListener('keydown',item_input);
    document.addEventListener('keydown',function(e){
      if(e.shiftKey&&e.key=="Enter"){
        if(confirm("この情報で確定してよろしいですか\n(レシートが印刷されます)"))mode=3;
        else mode=2;
      }
    });
    break;
    case 3:
    container.innerHTML="<h2>レシート&mdash;文実販売</h2><div id=\"item_container\"></div>";
    document.getElementById("footer").innerHTML="";
    var link=document.createElement('link');
    link.rel="stylesheet";
    link.type="text/css";
    link.href="./print.css";
    document.getElementsByTagName("head")[0].appendChild(link);
    item_draw();
    receipt_draw();
    print();
    break;
  }
};

var fin=function(){
  switch (mode) {
    case 0:
    if(!deco)return false;
    break;
    case 1:
    if(!item[0])return false;
    break;
  }
  return true;
};

var next=function(){
  if(!fin())return false;
  mode++;
  if(mode==4)document.Location.reload();
  init();
}

var deco_input=function(e){
  if(e.key==ID_BARCODE){
    if(is_barcode){
      if(tmp_int in deco_table){
        deco=tmp_int;
        document.getElementById("deco_input").innerHTML=deco_table[tmp_int][1];
        tmp_int=0;
      }
    }
    is_barcode=!is_barcode;
  }
  if(is_barcode&&isFinite(e.key)){
    tmp_int=tmp_int*10+parseInt(e.key);
  }
}

var item_input=function(e){
  if(isFinite(e.key)){
    tmp_int=tmp_int*10+parseInt(e.key);
    if(!is_barcode){
      tmp_arr[3]=tmp_int;
      tmp_arr[4]=tmp_arr[2]*tmp_arr[3];
      item[ctr]=tmp_arr.slice();
      item_draw();
    }
  }
  if(e.key=="Backspace"){
    if(!is_barcode){
      tmp_int=Math.floor(tmp_int/10);
      item[ctr][3]=tmp_int;
      item_draw();
    }
  }
  if(e.key==ID_BARCODE){
    if(is_barcode){
      tmp_arr[0]=tmp_int;
      tmp_int=0;
      if(!(tmp_arr[0] in item_table)){
        tmp_arr[1]="err";
        tmp_arr[2]=0;
        tmp_arr[3]=0;
        tmp_arr[4]=0;
      }else{
      tmp_arr[1]=item_table[tmp_arr[0]][0];
      tmp_arr[2]=item_table[tmp_arr[0]][1];
      if(tmp_arr[3]){
        tmp_arr[4]=tmp_arr[2]*tmp_arr[3];
        item[ctr]=tmp_arr.slice();
        tmp_arr=[0,"",0,0,0];
        item_append();
      }else{
        item[ctr]=tmp_arr.slice();
      }
    }
    }else{
      tmp_arr[3]=tmp_int;
      tmp_int=0;
      if(tmp_arr[0] in item_table){
        tmp_arr[1]=item_table[tmp_arr[0]][0];
        tmp_arr[2]=item_table[tmp_arr[0]][1];
        tmp_arr[4]=tmp_arr[2]*tmp_arr[3];
        item[ctr]=tmp_arr.slice();
        tmp_arr=[0,"",0,0,0];
        item_append();
      }
    }
      item_draw();
      is_barcode=!is_barcode;
  }
};

var item_draw=function(){
  var item_container=document.getElementById("item_container");
  var inner="";
  total=0;
  for (var key in item) {
    if(!(item[key][0] in item_table))continue;
    inner+="<div class=\"item\"><div class=\"item_name\">";
    inner+=item[key][1];
    inner+="</div><div class=\"item_price,print_hidden\">&yen";
    inner+=item[key][2];
    inner+="</div><div class=\"item_num\">&times";
    inner+=item[key][3]
    inner+="</div><div class=\"item_subtotal\">小計&nbsp&yen";
    inner+=item[key][4];
    inner+="</div></div>";
    total+=item[key][4]
  }
  inner+="<div class=\"item_total\">";
  inner+=total;
  inner+="</div>";
  item_container.innerHTML=inner;
}

var item_append=function(){
  ctr++;
  item[ctr]=[0,"",0,0,0];
};

var receipt_draw=function(){
  var tmp_str="<div id=\"receipt_title\">領収書</div><div id=\"receipt_serial\">No. ";
  tmp_str+=serial;
  tmp_str+="</div><div id=\"receipt_deco\">デコ名 : ";
  tmp_str+=deco_table[deco][1];
  tmp_str+="</div><div id=\"receipt_price\">&yen; ";
  tmp_str+=total.toLocaleString();
  tmp_str+="&ndash;</div><div id=\"receipt_proviso\">但し、文実販売代金として</div><div id=\"receipt_date\">発行日 : ";
  tmp_str+=getNow();
  tmp_str+="</div><div id=\"receipt_pub\">筑波大附属駒場中高文実販売</div><div id=\"receipt_stamp\">印</div>"
  document.getElementById("receipt").innerHTML=tmp_str;
  tmp_str="";
};

var getNow=function(){
  var date=new Date();
  var str_date=date.getFullYear();
  str_date+="年";
  str_date+=date.getMonth()+1;
  str_date+="月";
  str_date+=date.getDate();
  str_date+="日"
  return str_date;
}
