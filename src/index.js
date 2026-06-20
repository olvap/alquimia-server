import express from "express";
import { createServer  } from "http";
import { Server  } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("ping-test", (msg) => {
    console.log("¡MENSAJE RECIBIDO EN EL SERVER!:", msg);
    socket.emit("pong-test", "Servidor recibido: " + msg);
  });
  socket.on("create-room", (roomId) => {
    console.log("Evento recibido: create-room con ID:", roomId);
    if (rooms.has(roomId)) {
      socket.emit("error", "La sala ya existe");
      return;
    }
    rooms.set(roomId, { players: [socket.id], status: 'waiting'  });
    socket.join(roomId);
    socket.emit("room-created", roomId);
    io.emit("update-room-list", Array.from(rooms.keys()));

    console.log("Room creada ID:", roomId);
  });

  socket.on("join-room", ({ roomId, playerId, playerName  }) => {
    console.log("Datos recibidos:", { roomId, playerId, playerName  });

    const room = rooms.get(roomId);
    if (room) {
      room.players[playerId] = {
        socketId: socket.id,
        name: playerName
      };
      console.log(room.players)
      socket.join(roomId);

      // Notificar a todos
      io.to(roomId).emit("update-players", room.players);

      console.log(`Jugador ${playerName} unido. Jugadores actuales:`, Object.keys(room.players));
    }
  });

  socket.on("set-ready", ({ roomId, playerId  }) => {
    const room = rooms.get(roomId);
    if (room && room.players[playerId]) {
      room.players[playerId].ready = true;
      // Emitir a todos en la sala la actualización de jugadores
      io.to(roomId).emit("update-players", room.players);
    }
  });

  socket.on("reconnect-player", ({ roomId, playerId  }) => {
    const room = rooms.get(roomId);

    if (room && room.players[playerId]) {
      console.log(`Jugador ${playerId} reconectado en sala ${roomId}`);
      // Actualizamos el socketId del jugador para que el servidor 
      // sepa que ahora debe enviarle los eventos a este nuevo socket
      room.players[playerId].socketId = socket.id;
      socket.join(roomId);
      socket.emit("reconnected", { status: "success", roomData: room  });
    } else {
      socket.emit("error", "No se pudo recuperar la sesión");
    }
  });

  socket.on("get-room", (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.emit("room-data", {
        roomId: roomId,
        players: room.players
      });
    }
  });

  socket.on("get-rooms", () => {
    socket.emit("update-room-list", Array.from(rooms.keys()));
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
