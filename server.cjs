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

const users=[];

io.on('connection', (socket) => {
    console.log('New user connected: '+socket.id);
    users.push({name:"User",id:socket.id,mouse:{x:0,y:0}});
    // Send the full user list (with mouse positions) to the new user
    socket.emit('list-users', users); // <-- Add this line
    // Notify others about the new user
    socket.broadcast.emit('list-users', users);
    socket.emit('canvas-data', canvasData);

    socket.on('get-users', () => {
        socket.emit('list-users', users);
    });
    socket.on('canvas-data', (data) => {
        console.log("Canvas data received from user: "+socket.id);
        canvasData=data;
        socket.broadcast.except(socket).emit('canvas-data', canvasData);
    });
    socket.on('clear-canvas', () => {
        console.log("Canvas cleared by user: "+socket.id);
        canvasData = null;
        socket.broadcast.emit('canvas-data', canvasData);
    });

    socket.on('track-mouse', (data) => {
        const user = users.find(user => user.id === socket.id);
        if (user) {
            user.mouse = data;
        }
        const out = {
            id: socket.id,
            mouse: data
        };
        socket.broadcast.except(socket).emit('track-mouse', out);
    });
    socket.on('disconnect', () => {
        console.log('a user disconnected');
        users.splice(users.findIndex(user => user.id === socket.id), 1);
        socket.broadcast.emit('list-users', users);
    });


});

