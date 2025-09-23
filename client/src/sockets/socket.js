import { io } from 'socket.io-client';

// Configura la conexión con el servidor de Socket.io
const socket = io(import.meta.env.VITE_SERVER_URL, {
    transports: ['websocket'], // Usa solo websockets
    reconnection: true, // Intenta reconectar automáticamente
    reconnectionAttempts: 5, // Número de intentos antes de fallar
    reconnectionDelay: 1000, // Espera 1 segundo entre intentos
    //upgrade: false,              // quita intento de upgrade
    //perMessageDeflate: false,    // menos CPU (a costa de más ancho de banda)
});

// Variable para controlar si los listeners están configurados
let listenersConfigured = false;

// Función para configurar los listeners cuando Pinia esté disponible
const setupSocketListeners = async () => {
    if (listenersConfigured) return;
    
    try {
        const { useSocketStore } = await import('../stores/socketStore');
        
        socket.on('connect', () => {
            const socketStore = useSocketStore();
            socketStore.setConnected(true);
            //console.log('🔌 Socket conectado y store actualizada');
        });

        // Maneja errores globales
        socket.on('connect_error', (err) => {
            const socketStore = useSocketStore();
            socketStore.setConnected(false);
            if (import.meta.env.VITE_APP_ENV === "local") {
                console.error('Socket connection error:', err.message);
            }
        });

        socket.on('disconnect', (reason) => {
            const socketStore = useSocketStore();
            socketStore.setConnected(false);
            if (import.meta.env.VITE_APP_ENV === "local") {
                //console.log('Desconectado del servidor:', reason);
            }

            // Puedes emitir un evento global en Vue para redirigir
            window.dispatchEvent(new CustomEvent('socket-disconnected'));
        });
        
        listenersConfigured = true;
        //console.log('🔌 Socket listeners configurados exitosamente');
        
        // Si ya está conectado, ejecutar el handler de connect manualmente
        if (socket.connected) {
            const socketStore = useSocketStore();
            socketStore.setConnected(true);
        }
        
    } catch (error) {
        console.error('❌ Error configurando socket listeners:', error);
    }
};

// Exponer función de inicialización
socket.setupListeners = setupSocketListeners;

export default socket;
