
    // Create a new Peer
    const peer = new Peer();

    let conn;

    // Display your own peer ID
    peer.on('open', (id) => {
      document.getElementById('my-peer-id').value = id;
    });

    // Connect to a peer
    document.getElementById('connect').addEventListener('click', () => {
      const peerId = document.getElementById('peer-id').value;
      conn = peer.connect(peerId);

      conn.on('open', () => {
        appendMessage(`Connected to ${peerId}`);
        setupConnection();
      });

      conn.on('error', (err) => {
        console.error(err);
        appendMessage('Error connecting to peer.');
      });
    });

    // Setup connection for receiving messages
    peer.on('connection', (connection) => {
      conn = connection;
      setupConnection();
    });

    // Handle message sending
    document.getElementById('send').addEventListener('click', () => {
      const message = document.getElementById('message').value;
      if (conn && conn.open) {
        conn.send(message);
        appendMessage(`You: ${message}`);
        document.getElementById('message').value = '';
      }
    });

    // Setup connection for receiving messages
    function setupConnection() {
      conn.on('data', (data) => {
        appendMessage(`Peer: ${data}`);
      });

      conn.on('close', () => {
        appendMessage('Connection closed');
      });
    }

    // Append messages to the chat
    function appendMessage(message) {
      const chat = document.getElementById('chat');
      const messageElement = document.createElement('div');
      messageElement.textContent = message;
      chat.appendChild(messageElement);
      chat.scrollTop = chat.scrollHeight; // Scroll to the bottom
    }