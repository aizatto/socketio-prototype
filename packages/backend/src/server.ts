import * as http from 'http'
import * as SocketIO from 'socket.io';
import { Event } from 'shared/dist/enums';

const PORT = process.env.PORT ? process.env.PORT : 3001;

const httpServer = http.createServer();
const io = SocketIO(httpServer);

// I "redefine" this function so that I have a default timeout, and a better function name
const delay = (fn, ms = 100) => {
  setTimeout(fn, ms);
}

io.on('connection', (socket) => {
  let sessionID;

  // delay(() => {
  //   socket.emit(Event.ROOMS, Object.keys(socket.rooms));
  // });

  console.log(`${new Date()}: new Connection`);
  socket.emit('message', `Message from server: ${new Date()}`);

  socket.on('disconnect', () => {
    console.log(`Disconnected ${sessionID}:${socket.id}`);
  });

  socket.on(Event.SET_SESSION_ID, (newSessionID) => {
    sessionID = newSessionID;
  });

  socket.on(Event.JOIN_ROOM, (room: string) => {
    console.log(`${sessionID}:${socket.id} joining ${room}`);
    socket.join(room);
    io.to(room).emit(`new socket: ${socket.id}`)
    // Delayed because socket.rooms may not be populated yet
  });

  socket.on(Event.ROOMS, () => {
    socket.emit(Event.ROOMS, Object.keys(socket.rooms));
    // delay(() => {
    //   const serverRooms = Object.keys(socket.rooms);
    //   fn(serverRooms);
    // });
  });

  socket.on('message', (message: string) => {
    console.log(`Received from ${sessionID}:${socket.id}: ${message}`);
  })
});

httpServer.listen(PORT, function(){
  console.log(`listening on *:${PORT}`);
});