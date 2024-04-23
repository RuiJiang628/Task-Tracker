import { io } from 'socket.io-client'

const URL = process.env.URL
if (!URL) {
	console.error("missing URL environment variable")
	process.exit(1)
}

const socket = io(URL, { transports: ['websocket']});

socket.on('connect', () => {
    console.log('Connected to the server at ', URL);
    // Attempt to fetch tasks without authentication
    console.log('Attempting to fetch tasks without authentication');
    socket.emit('getTasks');
});

socket.on('tasksFetched', (tasks) => {
    // If tasks are returned, it means the server has a security loophole
    console.log('Tasks fetched without proper authentication:', tasks);
});

socket.on('unauthorized', (message) => {
    // Proper behavior: server should send an 'unauthorized' message
    console.error('Unauthorized:', message);
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
});

// Disconnect after a timeout to prevent the process from hanging
setTimeout(() => {
    socket.disconnect();
    process.exit(0);
}, 5000);
