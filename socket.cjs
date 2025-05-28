const { Server } = require('socket.io');

let canvasData;
const users = [];



function setupSocket(server) {
  const io = new Server(server, {
    cors:{ methods:['GET','POST'] }
  });
  function broadcastUserList(io) {
  const payload = users.map(u => ({
    userId:   u.userId,
    username: u.username,
    email:    u.email,
    boardData: {
      socketId: u.socketId,
      mouse:    u.mouse
    }
  }));
  io.emit('list-users', payload);
}
const addUser = (userData,socketId) => {
  if (!userData.userId) return;
        users.push({
        socketId: socketId,
        userId:   userData.userId,
        username: userData.username,
        email:    userData.email,
        mouse:    { x:0, y:0 }
      });
      broadcastUserList(io);
    }

  io.on('connection', socket => {
    console.log('New user connected:', socket.id);

    // initial list
    broadcastUserList(io);
    socket.emit('canvas-data', canvasData);

    socket.on('new-login', userData => {
      if (!userData.userId) return;
      // remove old entry + add new
      const idx = users.findIndex(u => u.socketId === socket.id);
      if (idx !== -1) users.splice(idx,1);
      if (users.some(u => u.username === userData.username && u.socketId !== socket.id)) {
        console.log("found duplicate user: " + userData.username);
        socket.emit('auth-error', { message: 'Username already connected.' });
        return;
      }
      addUser(userData,socket.id);

    });

    socket.on('logmeout',(userData)=>{
      const duplicateusers = users.filter(u => u.username === userData.username && u.socketId !== socket.id);
      if (duplicateusers.length > 0) {
        duplicateusers.forEach(u => {
          io.to(u.socketId).emit('logout');
        });
        // Remove the sender from users
        const idx = users.findIndex(u => u.socketId === socket.id);
        if (idx !== -1) users.splice(idx, 1);
        addUser(userData,socket.id);
        broadcastUserList(io);
      }
    })

    socket.on('canvas-data', data => {
      canvasData = data;
      socket.broadcast.emit('canvas-data', data);
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
        userId: user ? user.userId : -1,
        username: user ? user.username : "User",
        email: user ? user.email : ""
      };
      socket.broadcast.emit('track-mouse', out);
    });

    socket.on('disconnect', () => {
      const idx = users.findIndex(u => u.socketId === socket.id);
      if (idx !== -1) users.splice(idx,1);
      broadcastUserList(io);
    });
  });
}

module.exports = { setupSocket };