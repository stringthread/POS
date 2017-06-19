var mode=0;
var container,subtitle;
var xhr=new XMLHttpRequest();
var deco=0;
var serial=0;
var item=[[0,"",0,0,0]];
var tmp_int=0;
var is_barcode=false;
var ctr=0;
var total=0;
var select=0;
var nth=new Date().getFullYear()-1951;
const ID_BARCODE="Tab";

var init=function(){
  container=document.getElementById('container');
  subtitle=document.getElementById("subtitle");
  tmp_int=0;
  tmp_arr=[0,"",0,0,0];
  is_barcode=false;
  document.getElementById("date").innerHTML=getNow();
  if(deco)document.getElementById("deco").innerHTML="デコ : "+deco_table[deco][1];
  else document.getElementById("deco").innerHTML="";
  document.addEventListener('keydown',function(e){
    if(e.shiftKey&&e.key=="Enter"){
      next();
    }
    if(e.key=="Escape"){
      mode--;
      if(mode<=0)document.location.reload();
      init();
    }
  });
  switch(mode){
    case 0:
    subtitle.innerHTML="デコ選択";
    container.innerHTML="<div class=\"input\" id=\"deco_input\"></div>";
    document.getElementById("method").innerHTML="デコのバーコードを読み込んでください";
    document.getElementById("receipt").innerHTML="";
    document.addEventListener('keydown',deco_input);
    break;
    case 1:
    subtitle.innerHTML="商品入力";
    container.innerHTML="<div id=\"item_container\"><div id=\"item_total\">合計 : &yen;0</div></div>";
    document.getElementById("method").innerHTML="Shift+Enterで次の画面<br>Escapeで前の画面<br>Backspaceで個数を1桁消去<br>Deleteキーで品目を削除<br>上下キーで品目を選択<br><br>商品のバーコードを読み込んだ後、数字キーまたは左右矢印キーで個数を入力";
    document.getElementById("receipt").innerHTML="";
    document.removeEventListener('keydown',deco_input);
    document.addEventListener('keydown',item_input);
    break;
    case 2:
    subtitle.innerHTML="商品確認";
    container.innerHTML="<div id=\"item_container\"><div id=\"item_total\">合計 : &yen;0</div></div>";
    document.getElementById("method").innerHTML="Shift+Enterで確定<br>Escapeで前の画面";
    document.getElementById("receipt").innerHTML="";
    item_draw();
    document.removeEventListener('keydown',item_input);
    break;
    case 3:
    subtitle.innerHTML="文実販売";
    document.getElementById("receipt_caption").innerHTML="筑波大学附属駒場中高<br>第"+nth+"回文化祭実行委員会";
    container.innerHTML="<div id=\"item_container\"></div>";
    document.getElementById("footer").innerHTML="";
    item_draw();
    receipt_draw();
    sendDeal();
    print();
    window.location.reload();
    break;
  }
};

var fin=function(){
  switch (mode) {
    case 0:
    if(!deco)return false;
    getSerial();
    if(serial==-1){
      window.alert("エラーが発生しました。もう一度やり直してください");
      window.location.reload();
    }
    break;
    case 1:
    if(!item[0][0] in item_table || item[0][4]==0)return false;
    break;
  }
  return true;
};

var next=function(){
  if(!fin())return false;
  mode++;
  init();
}

var deco_input=function(e){
  if(e.key==ID_BARCODE){
    if(is_barcode){
      if(tmp_int in deco_table){
        deco=tmp_int;
        next();
      }else{
        window.alert("バーコードの読み取りに失敗しました。読み直してください");
      }
    }
    tmp_int=0;
    is_barcode=!is_barcode;
  }
  if(is_barcode&&isFinite(e.key)){
    tmp_int=tmp_int*10+parseInt(e.key);
  }
  e.preventDefault();
}

var item_input=function(e){
  if(isFinite(e.key)){
    if(!is_barcode&&select<=ctr)tmp_int=item[select][3];
    tmp_int=tmp_int*10+parseInt(e.key);
    if(!is_barcode&&select<=ctr){
      item[select][3]=tmp_int;
      item[select][4]=item[select][2]*item[select][3];
      item_draw();
    }
  }
  if(e.key=="Backspace"){
    if(!is_barcode){
      item[select][3]=Math.floor(item[select][3]/10);
      item_draw();
    }
  }
  if(e.key==ID_BARCODE){
    if(is_barcode){
      item[ctr][0]=tmp_int;
      tmp_int=0;
      if(item[ctr][0] in item_table){
        item[ctr][1]=item_table[item[ctr][0]][1];
        item[ctr][2]=item_table[item[ctr][0]][2];
        item[ctr][4]=item[ctr][2]*item[ctr][3];
      }else{
        window.alert("バーコードの読み取りに失敗しました。読み直してください");
        item.splice(select,1);
        if(ctr>0)ctr--;
        if(item.length==0)item[0]=[0,"",0,0,0];
      }
    }else if(select<=ctr&&ctr>=0){
      item[select][3]=tmp_int;
      tmp_int=0;
      item_append();
    }
    item_draw();
    is_barcode=!is_barcode;
  }
  if(e.key=="ArrowDown"){
    select++;
    if(select>ctr)select=ctr;
    item_draw();
  }
  if(e.key=="ArrowUp"){
    select--;
    if(select<0)select=0;
    item_draw();
  }
  if(e.key=="ArrowRight"){
    item[select][3]++;
    item_draw();
  }
  if(e.key=="ArrowLeft"){
    if(item[select][3]>=1){
      item[select][3]--;
      item_draw();
    }
  }
  if(e.key=="Delete"){
    item.splice(select,1);
    if(ctr>0)ctr--;
    if(item.length==0)item[0]=[0,"",0,0,0];
    item_draw();
  }
  e.preventDefault();
};

var item_draw=function(){
  var item_container=document.getElementById("item_container");
  var inner="";
  total=0;
  for (var key in item) {
    if(!(item[key][0] in item_table))continue;
    inner+="<div class=\"item\"";
    if(mode==1&&key==select)inner+=" style=\"background-color:#9999ff\"";
    inner+="><div class=\"item_name\">";
    inner+="<small>"+item[key][0]+"</small>&emsp;"+item[key][1];
    inner+="</div>\r\n<div class=\"item_price\">&yen";
    inner+=item[key][2];
    inner+="</div><div class=\"item_num\">&times";
    inner+=(item[key][3]==0)?"(1)":item[key][3];
    inner+="</div><div class=\"item_subtotal\">&yen";
    inner+=(item[key][4]==0)?item[key][2]:item[key][4];
    inner+="</div></div>";
    total+=(item[key][4]==0)?item[key][2]:item[key][4];
  }
  inner+="<div id=\"item_total\">合計&nbsp;:&nbsp;&yen;";
  inner+=total;
  inner+="</div>";
  item_container.innerHTML=inner;
}

var item_append=function(){
  if(item[ctr][0] in item_table&&item[ctr][3]>=0){
    ctr++;
    select=ctr;
    item[ctr]=[0,"",0,0,0];
  }
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
  tmp_str+="</div><div id=\"receipt_pub\">筑波大附属駒場中高<br>第"+nth+"回文化祭実行委員会</div><div id=\"receipt_stamp\">印</div>"
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
  str_date+="日";
  return str_date;
}

var getSerial=function(){
  xhr.abort();
  xhr.open("POST","./database.php");
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.send("mode=serial");
  xhr.onreadystatechange=function(){
    if(xhr.readyState==4){
      if(xhr.status==200&&isFinite(xhr.responseText)){
        serial=parseInt(xhr.responseText);
      }else{
        serial=-1;
      }
      if(serial==-1){
        alert("エラーが発生しました。もう一度やり直してください");
       window.location.reload();
      }
    }
  };
};

var sendDeal=function(){
  xhr.abort();
  var tmp_arr=[[]];
  for (var key in item) {
    var item_code=item[key][0];
    if(item_code==0)continue;
    tmp_arr[key]=[item_table[item_code][0],item[key][3]];
  }
  var data="mode=deal&serial=";
  data+=serial;
  data+="&deco=";
  data+=deco;
  data+="&item=";
  data+=encodeURIComponent(JSON.stringify(tmp_arr));
  xhr.open("POST","./database.php");
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.send(data);
  xhr.onreadystatechange=function(){
      if(xhr.readyState==4){
        if(xhr.responseText!=0){
          alert("エラーが発生しました");
        }
        window.location.reload();
      }
    };
};

window.onload=init;
