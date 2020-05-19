var socket, canvas, ctx, draw;
var mouseX, mouseY, mouseX1, mouseY1;
var isTouch;

/*events*/
function init() {
  socket = io.connect("/");
  canvas = document.getElementById("draw");
  ctx = canvas.getContext("2d");
  draw = false;
  isTouch = ("ontouchstart" in window);

  ctx.canvas.width = 800;
  ctx.canvas.height = 400;

  socket.on("draw", sio.draw);
  socket.on("tools", sio.tool);
}

var sio = {
  draw(data) {
    ctx.lineCap = "round";
    ctx.lineWidth = data.linesize;
    ctx.beginPath();node-dev 
    ctx.moveTo(data.before, data.before2);
    ctx.lineTo(data.after, data.after2);
    ctx.strokeStyle = data.color;
    ctx.stroke();
    ctx.closePath();
  },
  tool(data) {
    ctx.globalCompositeOperation = data.tool;
  }
};
/*events*/

function tool(btnNum){
  var mode = ["source-over", "destination-out"];
  ctx.globalCompositeOperation = mode[btnNum];
  socket.emit("tools", {tool: mode[btnNum]});
}

/*event handles*/
document.addEventListener("DOMContentLoaded", init);
/*event handles*/

var dev_draw = document.createElement("out");
dev_draw.setAttribute("id", "dev_draw");
document.body.appendChild(dev_draw);

var dev_move = document.createElement("out");
dev_move.setAttribute("id", "dev_move");
document.body.appendChild(dev_move);

$("#draw").bind({
  "touchmove mousemove": (e) => {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    this.mouseX = (isTouch ? e.originalEvent.touches[0].clientX : e.clientX);
    this.mouseY = (isTouch ? e.originalEvent.touches[0].clientY : e.clientY);
    mouseX = this.mouseX - rect.left;
    mouseY = this.mouseY - rect.top;
    dev_draw.innerHTML = `draw: ${draw}<br>`;
    if(draw === true) {
      socket.emit("draw", {
        linesize: 1,
        before: mouseX1,
        before2: mouseY1,
        after: mouseX,
        after2: mouseY,
        color: "#000000"
      });
      mouseX1 = mouseX;
      mouseY1 = mouseY;
      dev_move.innerHTML = ([
        `isTouch: ${isTouch}`,
        `x: ${this.mouseX}`,
        `y: ${this.mouseY}`
      ]).join("<br>");
    }
  },
  "touchstart mousedown": (e) => {
    e.preventDefault();
    draw = true;
    dev_draw.innerHTML = `draw: ${draw}<br>`;
    dev_move.innerHTML = `isTouch: ${isTouch}`;
    mouseX1 = mouseX;
    mouseY1 = mouseY;
  },
  "touchend touchstop mouseup mouseleave": (e) => {
    e.preventDefault();
    draw = false;
    dev_draw.innerHTML = `draw: ${draw}<br>`;
    dev_move.innerHTML = `isTouch: ${isTouch}`;
  }
});