const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(require('express').static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.on("draw", function (data) {
    console.log(data);
    socket.broadcast.emit("draw", data);
  });
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});