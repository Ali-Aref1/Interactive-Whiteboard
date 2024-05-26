const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const cors =  require('cors');
const server = http.createServer(app);

var temp;
const io = new  Server(server,{
    cors: {
        methods: ['GET', 'POST']
    }
});
const server_port = process.env.YOUR_PORT || process.env.PORT || 3001;
server.listen(server_port, () => {
    console.log('listening on : ' + server_port);
});

io.on('connection', (socket) => {
    console.log('New user connected: '+socket.id);
    socket.on('canvas-data', (data) => {
        socket.broadcast.except(socket).emit('canvas-data', data);
    });
});

io.on('disconnect', (socket) => {
    console.log('a user disconnected');
});

