// set canvas id to variable
var canvas = document.getElementById("draw");
var socket = io.connect("/");

// get canvas 2D context and set it to the correct size
var ctx = canvas.getContext("2d");
ctx.canvas.width = 800;
ctx.canvas.height = 400;

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
    socket.emit("draw", {before: mouseX1, before2: mouseY1, after: mouseX, after2: mouseY, color: color});
    mouseX1 = mouseX;
    mouseY1 = mouseY;
  }
});

  //クリックしたら描画をOKの状態にする
  canvas.addEventListener("mousedown",function(e) {
    draw = true;
    ctx.lineWidth = document.getElementById("lineWidth").value;
	  ctx.globalAlpha = document.getElementById("alpha").value/100;
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
  socket.emit("draw", {linesize: lineNum});
});

alpha.addEventListener("mousemove",function(){
  var alphaNum = document.getElementById("alpha").value;
  document.getElementById("alphaNum").innerHTML = alphaNum;
  socket.emit("linealpha", {lineAlpha: alphaNum});
});

function save(){
  var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
  window.location.href = image;
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
	ctx.lineWidth = document.getElementById("lineWidth").value;
	ctx.globalAlpha = document.getElementById("alpha").value/100;
	var rect = e.target.getBoundingClientRect();
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
    socket.emit("draw", {before: finger[i].x1, before2: finger[i].y1, after: finger[i].x, after2: finger[i].y, color: color});
		finger[i].x1=finger[i].x;
		finger[i].y1=finger[i].y;
  }
});

lineWidth.addEventListener("touchmove",function(){
  var lineNum = document.getElementById("lineWidth").value;
  document.getElementById("lineNum").innerHTML = lineNum;
  socket.emit("linesize", {linesize: lineNum});
});

alpha.addEventListener("touchmove",function(){
  var alphaNum = document.getElementById("alpha").value;
  document.getElementById("alphaNum").innerHTML = alphaNum;
  socket.emit("linealpha", {lineAlpha: alphaNum});
});

socket.on('send history', function (msg) {
  var image = new Image();
  image.src = msg;
  image.onload = function() {
    canvas.drawImage(image, 0, 0);
  };
});

socket.on("draw", function (data) {
  ctx.lineWidth = data.linesize;
  ctx.beginPath();
  ctx.moveTo(data.before, data.before2);
  ctx.lineTo(data.after, data.after2);
  ctx.strokeStyle = data.color;
  ctx.stroke();
  ctx.closePath();
});

socket.on("linealpha", function (alpha) {
  ctx.globalAlpha = alpha.lineAlpha;
});

