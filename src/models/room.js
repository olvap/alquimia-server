class Room {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = {};
  }

  addPlayer(playerId, playerData) {
    this.players[playerId] = {
      ...playerData,
      ready: false
    };
  }

  removePlayer(playerId) {
    delete this.players[playerId];
  }

  hasPlayer(socketId) {
    return Object.values(this.players).some(p => p.socketId === socketId);
  }

  removePlayerBySocketId(socketId) {
    for (const [playerId, player] of Object.entries(this.players)) {
      if (player.socketId === socketId) {
        delete this.players[playerId];
        return playerId; // Retornamos el ID para log o lógica extra
      }
    }
  }

  getPlayers() {
    return this.players;
  }

  setPlayerReady(playerId, isReady) {
    if (this.players[playerId]) {
      this.players[playerId].ready = isReady;
    }
  }

  isAllReady() {
    const players = Object.values(this.players);
    return players.length > 0 && players.every(p => p.ready);
  }
}

export default Room;
