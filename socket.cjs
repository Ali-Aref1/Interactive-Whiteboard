const { Server } = require('socket.io');

let canvasData;
const users = [];

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('New user connected: ' + socket.id);
        socket.emit('list-users', users);
        socket.broadcast.emit('list-users', users);
        socket.emit('canvas-data', canvasData);

        // Listen for user-auth event
        socket.on('user-auth', (userData) => {
            // Remove any existing entry for this socket
            const idx = users.findIndex(u => u.socketId === socket.id);
            if (idx !== -1) users.splice(idx, 1);

            // Add new user info
            users.push({
                socketId: socket.id,
                userId: userData.userId,
                username: userData.username,
                email: userData.email,
            });

            // Optionally emit updated user list
            io.emit('list-users', users);
        });

        socket.on('get-users', () => {
            socket.emit('list-users', users);
        });
        socket.on('canvas-data', (data) => {
            console.log("Canvas data received from user: " + socket.id);
            canvasData = data;
            socket.broadcast.except(socket).emit('canvas-data', canvasData);
        });
        socket.on('clear-canvas', () => {
            console.log("Canvas cleared by user: " + socket.id);
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

            // Remove user from array on disconnect
            const idx = users.findIndex(u => u.socketId === socket.id);
            if (idx !== -1) users.splice(idx, 1);
            io.emit('list-users', users);
        });
    });
}

module.exports = { setupSocket };