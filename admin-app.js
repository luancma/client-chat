// Check if a Peer ID exists in localStorage
let storedPeerId = localStorage.getItem("peerId");

// Initialize Peer with a custom ID if available
const peer = new Peer(storedPeerId, {
  debug: 2,
});

// Store active connections
let connections = [];

// Get DOM elements
const myPeerIdInput = document.getElementById("my-peer-id");
const roomIdInput = document.getElementById("room-id");
const joinRoomBtn = document.getElementById("join-room-btn");
const shareRoomBtn = document.getElementById("share-room-btn");
const connectBtn = document.getElementById("connect");
const sendBtn = document.getElementById("send");
const messageInput = document.getElementById("message");
const chatBox = document.getElementById("chat");
const peerIdInput = document.getElementById("peer-id");

// Current room ID
let currentRoomId = null;

// Handle Peer open event
peer.on("open", (id) => {
  myPeerIdInput.value = id;

  // If no Peer ID was stored, store the newly generated one
  if (!storedPeerId) {
    localStorage.setItem("peerId", id);
  }

  // Check if a room ID is present in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const roomIdFromURL = urlParams.get("roomId");
  const peerIdFromURL = urlParams.get("peerId");
  if (roomIdFromURL) {
    joinRoom(roomIdFromURL, peerIdFromURL);
  }
});

// Handle Peer errors (e.g., ID already in use)
peer.on("error", (err) => {
  console.error(err);

  if (err.type === "unavailable-id") {
    // Generate a new Peer ID since the stored one is unavailable
    generateAndStoreNewPeerId();
  } else {
    appendMessage(`Error: ${err.type}`);
  }
});

// Function to generate a new Peer ID and store it
function generateAndStoreNewPeerId() {
  const newPeerId = "peer-" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("peerId", newPeerId);
  peer.id = newPeerId;
  myPeerIdInput.value = newPeerId;
  appendMessage(`Generated new Peer ID: ${newPeerId}`);
}

// Handle incoming connections
peer.on("connection", (conn) => {
  // Check if the connection has the correct room ID
  const incomingRoomId = conn.metadata && conn.metadata.roomId;
  if (incomingRoomId && incomingRoomId === currentRoomId) {
    connections.push(conn);
    appendMessage(`Peer ${conn.peer} joined the room.`);
    setupConnection(conn);
  } else {
    // Reject connection if room ID doesn't match
    conn.close();
    appendMessage(`Rejected connection from ${conn.peer} (invalid room ID).`);
  }
});

// Function to join or create a room
function joinRoom(roomId, peerId) {
  if (!roomId && !peerId) {
    currentRoomId = generateRoomId();
  } else {
    currentRoomId = roomId;
  }

  roomIdInput.value = currentRoomId;

  // Update the URL with the room ID
  const newUrl = `${window.location.origin}${window.location.pathname}?roomId=${currentRoomId}&peerId=${peerId}`;
  window.history.replaceState(null, null, newUrl);

  appendMessage(`Joined room: ${currentRoomId}`);
}

// Generate a unique room ID
function generateRoomId() {
  return "room-" + Math.random().toString(36).substr(2, 9);
}

// Function to connect to a peer
function connectToPeer(peerId) {
  if (!currentRoomId) {
    alert("Join or create a room before connecting to peers.");
    return;
  }

  // Check if already connected to the peer
  if (connections.find((c) => c.peer === peerId)) {
    alert(`Already connected to peer ${peerId}`);
    return;
  }

  const conn = peer.connect(peerId, {
    metadata: { roomId: currentRoomId },
  });

  conn.on("open", () => {
    appendMessage(`Connected to ${peerId}`);
    connections.push(conn);
    setupConnection(conn);
  });

  conn.on("error", (err) => {
    console.error(err);
    appendMessage("Error connecting to peer.");
  });
}

// Setup connection event handlers
function setupConnection(conn) {
  conn.on("data", (data) => {
    appendMessage(`Peer ${conn.peer}: ${data}`);
  });

  conn.on("close", () => {
    appendMessage(`Connection with ${conn.peer} closed.`);
    connections = connections.filter((c) => c !== conn);
  });

  conn.on("error", (err) => {
    console.error(err);
    appendMessage(`Connection error with ${conn.peer}.`);
  });
}

// Append messages to the chat box
function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle Join/Create Room button click
joinRoomBtn.addEventListener("click", () => {
  const roomId = roomIdInput.value.trim();
  if (!roomId) {
    // If room ID is empty, create a new one
    joinRoom();
  } else {
    // Join the existing room
    joinRoom(roomId);
  }
});

// Handle Share Room URL button click
shareRoomBtn.addEventListener("click", () => {
  if (!currentRoomId) {
    alert("You need to join or create a room first.");
    return;
  }
  const shareUrl = `${window.location.origin}${window.location.pathname}?roomId=${currentRoomId}&peerId=${peer.id}`;
  navigator.clipboard
    .writeText(shareUrl)
    .then(() => {
      alert("Room URL copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      alert("Failed to copy Room URL. Please copy it manually.");
    });
});

// Handle sending a message
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message && connections.length > 0) {
    appendMessage(`You: ${message}`);
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
    messageInput.value = "";
  }
});
