const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(require('express').static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

io.sockets.on('connection', function (socket) {
    socket.on('clear send', function () {
        socket.emit('clear user');
    });
    socket.on('server send', function (msg) {
        socket.emit('send user', msg);
    });
    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});