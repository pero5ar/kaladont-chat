import io from 'socket.io-client';

let _socket = null;

export const connect = () => {
    if (_socket) {
        disconnect();
    }
    _socket = io();
}

export const sendMessage = (msg) => {
    _socket.emit('message', msg);
}

export const subscribeToMessages = (cb) => _socket.on('message', (msg) => cb(msg));

export const disconnect = () => {
    _socket.close();
    _socket = null;
}