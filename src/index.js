const express = require("express");
const { createServer  } = require("http");
const { Server  } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // En producción, reemplaza con la URL de tu frontend
    methods: ["GET", "POST"]
  }

});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

});

const rooms = new Map(); // Estructura: { roomId: { players: [], status: 'waiting'  }  }

io.on("connection", (socket) => {

  // Crear una sala
  socket.on("create-room", (roomId) => {
    if (rooms.has(roomId)) {
      socket.emit("error", "La sala ya existe");
      return;
    }
    rooms.set(roomId, { players: [socket.id], status: 'waiting'  });
    socket.join(roomId);
    socket.emit("room-created", roomId);
    io.emit("update-room-list", Array.from(rooms.keys()));
  });

  // Unirse a una sala
  socket.on("join-room", (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.players.length < 4) { // Límite de 4 jugadores
      room.players.push(socket.id);
      socket.join(roomId);
      socket.emit("room-joined", roomId);
    } else {
      socket.emit("error", "Sala llena o no encontrada");
    }
  });

  // Enviar lista al conectar
  socket.on("get-rooms", () => {
    socket.emit("update-room-list", Array.from(rooms.keys()));
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
