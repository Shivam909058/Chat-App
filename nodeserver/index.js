const http = require('http').createServer(); // it helps to create a server 
// lets create  documentation for this server

const io = require('socket.io')(http, { 
  cors: {
    origin: "*", // allow to server to accept request from different origin and "*" means from all the origins
  },
});

const users = {}; // object to store users and n number of users can be stored
const PASSWORD = '12345';  // set your password here required to enter the chat room or have the permission to join the server

io.on('connection', (socket) => { // io.on() method is used to listen to the event and the event is connection
    socket.on('new-user-joined', (data) => { // listen to the event new-user-joined
        const {name, password} = data; // get the name and password from the data object
        if (password !== PASSWORD) {
            return;  // don't allow user to join if the password is incorrect
        }
        users[socket.id] = name; // store the user name in the object with key as socket id
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', (data) => { // listen to the event send and send the message to all the users
        if(data.type === 'file') {
            socket.broadcast.emit('receive', { type: 'file', file: data.file });
        } else {
            socket.broadcast.emit('receive', { message: data.message, name: users[socket.id] });
        }
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});

http.listen(8000, () => {
  console.log('listening on *:8000');
});
