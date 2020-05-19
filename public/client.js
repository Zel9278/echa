var canvas = document.getElementById("draw");
var socket = io.connect("/");

var ctx = canvas.getContext("2d");
ctx.canvas.width = 800;
ctx.canvas.height = 400;

var mouse = {x:0,y:0,x1:0,y1:0,color: 'white'};
var draw = false;

function tool(btnNum){
  if (btnNum == 1){
    ctx.globalCompositeOperation = 'source-over';
    const tool = 'source-over';
    socket.emit("tools", {tool: tool})
  }
  else if (btnNum == 2){
    ctx.globalCompositeOperation = 'destination-out';
    const tool = 'destination-out';
    socket.emit("tools", {tool: tool})
  }
}

canvas.addEventListener("mousemove",function(e) {
  var rect = e.target.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  
  var color = document.getElementById("hex").value;
  var lineNum = document.getElementById("lineWidth").value;
  document.getElementById("lineNum").innerHTML = lineNum;
  
  if(draw === true) {
    ctx.beginPath();
    ctx.moveTo(mouseX1,mouseY1);
    ctx.lineTo(mouseX,mouseY);
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.stroke();
    socket.emit("draw", {linesize: lineNum, before: mouseX1, before2: mouseY1, after: mouseX, after2: mouseY, color: color});
    mouseX1 = mouseX;
    mouseY1 = mouseY;
  }
});

  canvas.addEventListener("mousedown",function(e) {
    draw = true;
    ctx.lineWidth = document.getElementById("lineWidth").value;
    mouseX1 = mouseX;
    mouseY1 = mouseY;
    undoImage = ctx.getImageData(0, 0,canvas.width,canvas.height);
});

canvas.addEventListener("mouseup", function(e){
  draw = false;
});

function save(){
  var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
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
  var lineNum = document.getElementById("lineWidth").value;
  document.getElementById("lineNum").innerHTML = lineNum;
	for(var i=0;i<finger.length;i++){
		finger[i].x = e.touches[i].clientX-rect.left;
		finger[i].y = e.touches[i].clientY-rect.top;
		ctx.beginPath();
		ctx.moveTo(finger[i].x1,finger[i].y1);
		ctx.lineTo(finger[i].x,finger[i].y);
		ctx.lineCap="round";
    ctx.strokeStyle = color;
		ctx.stroke();
    socket.emit("draw", {linesize: lineNum, before: finger[i].x1, before2: finger[i].y1, after: finger[i].x, after2: finger[i].y, color: color});
		finger[i].x1=finger[i].x;
		finger[i].y1=finger[i].y;
  }
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

socket.on("tools", function (data) {
  ctx.globalCompositeOperation = data.tool;
});