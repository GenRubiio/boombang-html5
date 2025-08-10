import { io } from 'socket.io-client';

// Configura la conexión con el servidor de Socket.io
const socket = io(import.meta.env.VITE_SERVER_URL, {
    transports: ['websocket'], // Usa solo websockets
    reconnection: true, // Intenta reconectar automáticamente
    reconnectionAttempts: 5, // Número de intentos antes de fallar
    reconnectionDelay: 1000, // Espera 1 segundo entre intentos
});

// Maneja errores globales
socket.on('connect_error', (err) => {
    if (import.meta.env.VITE_APP_ENV === "local") {
        console.error('Socket connection error:', err.message);
    }
});

socket.on('disconnect', (reason) => {
    if (import.meta.env.VITE_APP_ENV === "local") {
        console.log('Desconectado del servidor:', reason);
    }

    // Puedes emitir un evento global en Vue para redirigir
    window.dispatchEvent(new CustomEvent('socket-disconnected'));
});

export default socket;
