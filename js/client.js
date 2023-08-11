const socket = io('http://localhost:8000'); // connect to the server which is running on port number 8000 of localhost
const form = document.getElementById('send-container'); // get the form element dom manipualtion
const messageInput = document.getElementById('messageInp'); // get the input element dom manipualtion
const mediaInput = document.getElementById('mediaInp'); // get the input element dom manipualtion
const messageContainer = document.querySelector(".container"); // get the div element dom manipualtion
var audio = new Audio('ting.mp3');

const append = (message, position, type = 'text', file) => { // it pushes the message to the container or send the meassage to the container
    let messageElement;
    if (type === 'file') {
        const fileType = message.split(";")[0].split("/")[1]; // it means the file type is image message.split(";")[0] means data:image/png is split into data:image and png and message.split(";")[0].split("/") means data:image is split into data and image and message.split(";")[0].split("/")[1] means image
        if (fileType.startsWith("image")) {
            messageElement = document.createElement('img');
            messageElement.src = message;
        } else if (fileType.startsWith("video")) { // it means the file type is video
            messageElement = document.createElement('video');
            messageElement.src = message;
            messageElement.controls = true;
        } else if (fileType.startsWith("audio")) { // it means the file type is audio
            messageElement = document.createElement('audio');
            messageElement.src = message;
            messageElement.controls = true;
        } else {
            // create a download link
            messageElement = document.createElement('a');
            messageElement.href = message;
            messageElement.innerText = 'Download file';
            messageElement.download = file.name;
        }
    } else {
        messageElement = document.createElement('div');
        messageElement.innerText = message;
    }
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if (position === 'left'){ // it means the message is received from the left side and play the audio
        audio.play();
    }
}

form.addEventListener('submit', // This function handles the sending of a message by the user. It first checks to see if the message input is empty, and if not, it appends the message to the chat room. It then emits the message to the server socket, along with the type of message. It then resets the message input.
// The function also handles the sending of images. First, it checks to see if there is a file selected. If there is, it creates a FileReader object and sets its onloadend function to convert the file to a data URL, which is then emitted to the server socket along with the type of message and the name of the file. Finally, it resets the media input.

(e) => {
    e.preventDefault();
    const message = messageInput.value;
    if(message) {
        append(`You: ${message}`, 'right');
        socket.emit('send', {type: 'message', message: message});
    }
    messageInput.value = '';

    const file = mediaInput.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            socket.emit('send', { type: 'file', file: reader.result, name: file.name });
        }
        reader.readAsDataURL(file);
    }
    mediaInput.value = '';
});

const name = prompt("Enter your name to join");
const password = prompt("Enter the password");
socket.emit('new-user-joined', {name, password});

socket.on('user-joined', (name) => {
    append(`${name} joined the chat`, 'right');
});

socket.on('receive', (data) => {
    if(data.type === 'file') {
        append(data.file, 'left', 'file', data);
    } else {
        append(`${data.name}: ${data.message}`, 'left');
    }
});

socket.on('left', (name) => {
    append(`${name} left the chat`, 'left');
});
