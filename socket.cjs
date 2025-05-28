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

            // Add new user info (with empty mouse by default)
            users.push({
                socketId: socket.id,
                userId: userData.userId,
                username: userData.username,
                email: userData.email,
                mouse: { x: 0, y: 0 }
            });
            console.log(users);

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
            // Find user by socketId
            const user = users.find(user => user.socketId === socket.id);
            if (user) {
                user.mouse = data;
            }
            const out = {
                id: socket.id,
                mouse: data,
                userId: user ? user.id : -1,
                username: user ? user.username : "User",
                email: user ? user.email : ""
            };
            socket.broadcast.except(socket).emit('track-mouse', out);
        });

        socket.on('disconnect', () => {
            console.log('a user disconnected');
            const idx = users.findIndex(user => user.socketId === socket.id);
            if (idx !== -1) users.splice(idx, 1);
            io.emit('list-users', users);
        });
    });
}

module.exports = { setupSocket };