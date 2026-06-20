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

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
