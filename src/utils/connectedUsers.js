class ConnectedUsers {
  constructor() {
    this.connectedUsers = new Map();
  }

  addUser(userId, socketId) {
    console.log("Addinf user: " + userId)
    this.connectedUsers.set(userId, socketId);
  }

  removeUser(socketId) {
    for (const [userId, id] of this.connectedUsers.entries()) {
      if (id === socketId) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  getUserSocketId(userId) {
    console.log("this is the userID: " + userId)
    return this.connectedUsers.get(userId);
  }
}

export default new ConnectedUsers();
// Usage example in socket server
