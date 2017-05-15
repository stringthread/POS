var mode=0;
var container,subtitle;
var xhr=new XMLHttpRequest();
var deco=0;
var serial=0;
var item=[[0,"",0,0,0]];
var tmp_int=0;
var tmp_arr=[0,"",0,0,0];
var is_barcode=false;
var ctr=0;
var total=0;
var select=0;
const ID_BARCODE=";";

window.onload=function(){init();};

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
    subtitle.innerHTML="デコ選択"
    container.innerHTML="<div class=\"input\" id=\"deco_input\"></div>";
    document.getElementById("method").innerHTML="Shift+Enterで次の画面<br>Escapeでリセット";
    document.getElementById("receipt").innerHTML="";
    document.addEventListener('keydown',deco_input);
    break;
    case 1:
    subtitle.innerHTML="商品入力"
    container.innerHTML="<div id=\"item_container\"></div>";
    document.getElementById("method").innerHTML="Shift+Enterで次の画面<br>Escapeで前の画面<br>Backspaceで入力文字を1桁消去<br><br>商品のバーコードを読み込んだ後、数字キーで個数を入力";
    document.getElementById("receipt").innerHTML="";
    document.removeEventListener('keydown',deco_input);
    document.addEventListener('keydown',item_input);
    break;
    case 2:
    subtitle.innerHTML="商品確認"
    container.innerHTML="<div id=\"item_container\"><div id=\"item_total\">合計金額 : &yen;0</div></div>";
    document.getElementById("method").innerHTML="Shift+Enterで確定<br>Escapeで前の画面";
    document.getElementById("receipt").innerHTML="";
    item_draw();
    document.removeEventListener('keydown',item_input);
    break;
    case 3:
    subtitle.innerHTML="文実販売<div id=\"receipt_caption\">レシート</div>"
    container.innerHTML="<div id=\"item_container\"></div>";
    document.getElementById("footer").innerHTML="";
    item_draw();
    receipt_draw();
    print();
    break;
    case 4:
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
    if(!item[0])return false;
    break;
    case 3:
    sendDeal();
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
      item[select][3]=tmp_int;
      item[select][4]=item[select][2]*item[select][3];
      item_draw();
    }
  }
  if(e.key=="Backspace"){
    if(!is_barcode){
      tmp_int=Math.floor(tmp_int/10);
      item[select][3]=tmp_int;
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
      tmp_arr[1]=item_table[tmp_arr[0]][1];
      tmp_arr[2]=item_table[tmp_arr[0]][2];
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
        tmp_arr[1]=item_table[tmp_arr[0]][1];
        tmp_arr[2]=item_table[tmp_arr[0]][2];
        tmp_arr[4]=tmp_arr[2]*tmp_arr[3];
        item[select]=tmp_arr.slice();
        tmp_arr=[0,"",0,0,0];
        item_append();
        select=ctr;
      }
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
  if(e.key=="Delete"){
    item.splice(select,1);
    if(ctr>0)ctr--;
    item_draw();
  }
};

var item_draw=function(){
  var item_container=document.getElementById("item_container");
  var inner="";
  total=0;
  for (var key in item) {
    if(!(item[key][0] in item_table))continue;
    inner+="<div class=\"item\""
    if(mode==1&&key==select)inner+=" style=\"background-color:#9999ff\""
    inner+="><div class=\"item_name\">";
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
  inner+="<div id=\"item_total\">合計金額 : &yen;";
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
  tmp_str+="</div><div id=\"receipt_pub\">筑波大附属駒場中高文化祭実行委員会</div><div id=\"receipt_stamp\">印</div>"
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
  var data="mode=deal&serial=";
  data+=serial;
  data+="&deco=";
  data+=deco;
  data+="&item=";
  for(k in item){
    if(item[k][0] in item_table){
    data+=item_table[item[k][0]][0];
    data+='%2c';
    data+=item[k][3];
    data+='%2f';
  }
  }
  alert(data);
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
