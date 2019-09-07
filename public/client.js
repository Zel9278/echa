// set canvas id to variable
var canvas = document.getElementById("draw");
$(function() {
    var offset = 5;
    var fromX;
    var fromY;
    var drawFlag = false;
    var context = $("canvas").get(0).getContext('2d');
    var socket = io.connect('https://echa.glitch.me');
 
    // サーバからメッセージ受信
    socket.on('send user', function (msg) {
        context.strokeStyle = msg.color;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(msg.fx, msg.fy);
        context.lineTo(msg.tx, msg.ty);
        context.stroke();
        context.closePath(); 
    });
 
    socket.on('clear user', function () {
        context.clearRect(0, 0, $('canvas').width(), $('canvas').height());
    });

// get canvas 2D context and set it to the correct size
var ctx = canvas.getContext("2d");
ctx.canvas.width = 800;
ctx.canvas.height = 400;

var pen = document.getElementById('pencil');
var era = document.getElementById('eraser');
function tool(btnNum){
  // クリックされボタンが鉛筆だったら
  if (btnNum == 1){
    ctx.globalCompositeOperation = 'source-over';
  }
  else if (btnNum == 2){
    ctx.globalCompositeOperation = 'lighter';
  }
  else if (btnNum == 3){
    ctx.globalCompositeOperation = 'destination-over';
  }
  // クリックされボタンが消しゴムだったら
  else if (btnNum == 4){
    ctx.globalCompositeOperation = 'destination-out';
  }
}

var mouse = {x:0,y:0,x1:0,y1:0,color: 'white'};
var draw = false;

//マウスの座標を取得する
canvas.addEventListener("mousemove",function(e) {
  var rect = e.target.getBoundingClientRect();
  ctx.lineWidth = document.getElementById("lineWidth").value;
	ctx.globalAlpha = document.getElementById("alpha").value/100;

  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  
  var color = document.getElementById("hex").value;
  if(draw === true) {
    ctx.beginPath();
    ctx.moveTo(mouseX1,mouseY1);
    ctx.lineTo(mouseX,mouseY);
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.stroke();
    socket.emit('server send', { fx:fromX, fy:fromY, tx:toX, ty:toY, color:context.strokeStyle });
    mouseX1 = mouseX;
    mouseY1 = mouseY;
  }
});

  //クリックしたら描画をOKの状態にする
  canvas.addEventListener("mousedown",function(e) {
    draw = true;
    mouseX1 = mouseX;
    mouseY1 = mouseY;
    undoImage = ctx.getImageData(0, 0,canvas.width,canvas.height);
});

//クリックを離したら、描画を終了する
canvas.addEventListener("mouseup", function(e){
  draw = false;
});

/*ーーーーーーーーーーー*/

lineWidth.addEventListener("mousemove",function(){
var lineNum = document.getElementById("lineWidth").value;
document.getElementById("lineNum").innerHTML = lineNum;
});

alpha.addEventListener("mousemove",function(){
var alphaNum = document.getElementById("alpha").value;
document.getElementById("alphaNum").innerHTML = alphaNum;
});

function save(){
  const base64 = canvas.toDataURL("image/png");
    base64 = base64.replace("image/png", "image/octet-stream");
    window.open(base64,"save");
}

/*ーーーーーーーーーーー*/

var finger=new Array;
for(var i=0;i<10;i++){
  finger[i]={
		x:0,y:0,x1:0,y1:0,
		color:"rgb("
		+Math.floor(Math.random()*16)*15+","
		+Math.floor(Math.random()*16)*15+","
		+Math.floor(Math.random()*16)*15
		+")"
	};
}

canvas.addEventListener("touchstart",function(e){
  e.preventDefault();
	var rect = e.target.getBoundingClientRect();
	ctx.lineWidth = document.getElementById("lineWidth").value;
	ctx.globalAlpha = document.getElementById("alpha").value/100;
	for(var i=0;i<finger.length;i++){
		finger[i].x1 = e.touches[i].clientX-rect.left;
		finger[i].y1 = e.touches[i].clientY-rect.top;
	}
});

canvas.addEventListener("touchmove",function(e){
	e.preventDefault();
	var rect = e.target.getBoundingClientRect();
  var color = document.getElementById("hex").value;
	for(var i=0;i<finger.length;i++){
		finger[i].x = e.touches[i].clientX-rect.left;
		finger[i].y = e.touches[i].clientY-rect.top;
		ctx.beginPath();
		ctx.moveTo(finger[i].x1,finger[i].y1);
		ctx.lineTo(finger[i].x,finger[i].y);
		ctx.lineCap="round";
    ctx.strokeStyle = color;
		ctx.stroke();
    socket.emit('server send', { fx:fromX, fy:fromY, tx:toX, ty:toY, color:context.strokeStyle });
		finger[i].x1=finger[i].x;
		finger[i].y1=finger[i].y;
  }
});
});