const { Server } = require('socket.io');

let canvasData;
const users = [];



function setupSocket(server) {
  const io = new Server(server, {
    cors:{ methods:['GET','POST'] }
  });
  function broadcastUserList(io) {
    console.log('Broadcasting user list:', users);
  const payload = users.map(u => ({
    userId:   u.userId,
    username: u.username,
    email:    u.email,
    boardData: {
      socketId: u.socketId,
      mouse:    u.mouse
    }
  }));
  io.emit('list-users', users);
}
const addUser = (socketUser) => {
  console.log(socketUser);
  if (!socketUser.id) return;
        users.push({
        ...socketUser,
        mouse:    { x:0, y:0 }
      });
      console.log(users);
      broadcastUserList(io);
    }

  io.on('connection', socket => {
    console.log('New user connected:', socket.id);

    // initial list
    broadcastUserList(io);
    socket.emit('canvas-data', canvasData);
    socket.on('new-login', userData => {
      const socketUser=({...userData, socketId: socket.id});
      if (!userData.id) return;
      // remove old entry + add new
      const idx = users.findIndex(u => u.socketId === socket.id);
      if (idx !== -1) users.splice(idx,1);
      if (users.some(u => u.username === userData.username && u.socketId !== socket.id)) {
        console.log("found duplicate user: " + userData.username);
        socket.emit('auth-error', { message: 'Username already connected.' });
        return;
      }
      
      addUser(socketUser);

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
        mouse: data
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