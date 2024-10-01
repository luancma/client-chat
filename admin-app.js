// Create a new Peer instance
const peer = new Peer();
let connections = [];
const shareBtn = document.getElementById("share-room-btn");

// Function to connect to another peer
function connectToPeer(peerId) {
  const conn = peer.connect(peerId);

  conn.on("open", () => {
    appendMessage(`Connected to ${peerId}`);
    connections.push(conn); // Add the connection to the list
    setupConnection(conn); // Set up event handlers for the connection
  });

  conn.on("error", (err) => {
    console.error(err);
    appendMessage("Error connecting to peer.");
  });
}

// Set up event handlers for a connection
function setupConnection(conn) {
  conn.on("data", (data) => {
    appendMessage(`Peer ${conn.peer}: ${data}`);
  });

  conn.on("close", () => {
    appendMessage(`Connection with ${conn.peer} closed`);
    connections = connections.filter((c) => c !== conn); // Remove the closed connection
  });
}

// Append a message to the chat display
function appendMessage(message) {
  const chat = document.getElementById("chat");
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  chat.appendChild(messageElement);
  chat.scrollTop = chat.scrollHeight; // Scroll to the bottom
}

// ############################################################

// Display your own peer ID
peer.on("open", (id) => {
  document.getElementById("my-peer-id").value = id;
});

// Handle incoming connections
peer.on("connection", (conn) => {
  connections.push(conn); // Add the incoming connection to the list
  appendMessage(`Connected to ${conn.peer}`);
  setupConnection(conn); // Set up event handlers for the connection
});

// Handle connecting to a peer
document.getElementById("connect").addEventListener("click", () => {
  const peerId = document.getElementById("peer-id").value;
  if (peerId) {
    connectToPeer(peerId);
  }
});

// Handle sending a message
document.getElementById("send").addEventListener("click", () => {
  const message = document.getElementById("message").value;
  if (message) {
    appendMessage(`You: ${message}`);
    // Send the message to all connected peers
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
    document.getElementById("message").value = "";
  }
});

shareBtn?.addEventListener("click", () => {
  const adminId = getPeerIdFromLocalStorage();
  if (adminId) {
    const url = `${window.location.origin}/client.html?adminId=${adminId}`;
    navigator.clipboard.writeText(adminId);
  }
});
