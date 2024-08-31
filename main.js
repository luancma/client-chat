const peer = new Peer();  // Create a new Peer instance
let conn;

peer.on('open', (id) => {
    alert(`Your peer ID is: ${id}. Share this with your friend to connect.`);
});

peer.on('connection', (connection) => {
    conn = connection;
    setupConnection();
});

document.getElementById('connectButton').addEventListener('click', () => {
    const peerId = document.getElementById('peerIdInput').value;
    if (!peerId) return alert('Please enter a peer ID');
    
    conn = peer.connect(peerId);
    conn.on('open', setupConnection);
});

function setupConnection() {
    document.getElementById('messageInput').disabled = false;

    conn.on('data', (data) => {
        displayMessage(`Peer: ${data}`);
    });

    conn.on('close', () => {
        alert('Connection closed');
        document.getElementById('messageInput').disabled = true;
    });

    document.getElementById('messageInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const message = e.target.value;
            displayMessage(`You: ${message}`);
            conn.send(message);
            e.target.value = '';
        }
    });
}

function displayMessage(message) {
    const messages = document.getElementById('messages');
    const msgElem = document.createElement('div');
    msgElem.textContent = message;
    messages.appendChild(msgElem);
}