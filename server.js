const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = 80;

app.use(require('express').static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.on("draw", function (data) {
    io.emit("draw", data);
  });
  
  socket.on('send history', function (msg) {
    //socket.broadcast.emit("send history", canvasImage);
  });
  
  socket.on('tools', function (msg) {
    io.emit("tools", msg);
  });
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});