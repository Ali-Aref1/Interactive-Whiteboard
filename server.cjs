const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const cors =  require('cors');
const server = http.createServer(app);
let canvasData;
var temp;
const io = new  Server(server,{
    cors: {
        methods: ['GET', 'POST']
    }
});
const server_port = 3001;
server.listen(server_port, () => {
    console.log('listening on : ' + server_port);
});

io.on('connection', (socket) => {
    console.log('New user connected: '+socket.id);
    socket.emit('canvas-data', canvasData);
    socket.on('canvas-data', (data) => {
        console.log("Canvas data received from user: "+socket.id);
        canvasData=data;
        socket.broadcast.except(socket).emit('canvas-data', canvasData);
    });
});

io.on('disconnect', (socket) => {
    console.log('a user disconnected');
});

