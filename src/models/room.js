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

  getPlayers() {
    return this.players;
  }
}

export default Room;
