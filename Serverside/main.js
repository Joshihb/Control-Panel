const net = require('net');
const PORT = 4500

const server = net.createServer((socket) => {
    console.log('Client Connected.');
    socket.on('data', (data) => {
        console.log('Recieved:', data.toString());
        socket.write(`server recieved: ${data}`);
    });

    socket.on('end', () => {
        console.log('Client disconnected.');
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err)
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});