async function createVideoRoom(sessionId) {
  return {
    room_id: `room-${sessionId}`,
    room_url: `https://meet.example.com/kyc-${sessionId}`,
    provider: 'mock'
  };
}

async function endVideoRoom(roomId) {
  console.log(`Video room ${roomId} ended`);
  return true;
}

module.exports = { createVideoRoom, endVideoRoom };
