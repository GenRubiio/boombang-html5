/**
 * Buffer global para almacenar eventos que llegan antes de que la escena esté lista
 * Este sistema se activa cuando el usuario se une a una sala y antes de que Phaser cree la escena
 */

import socket from "../sockets/socket";
import ResponseSocketsEnum from "../enums/ResponseSocketsEnum";

class EarlyEventBuffer {
    constructor() {
        this.buffer = [];
        this.isActive = false;
        this.listener = null;
    }

    /**
     * Activa el buffer y comienza a capturar eventos NEW_USER_JOIN_SCENE
     */
    activate() {
        if (this.isActive) {
            return;
        }

        this.isActive = true;
        this.buffer = [];

        // Configurar listener para capturar eventos
        this.listener = (data) => {
            if (this.isActive) {
                this.buffer.push({
                    type: 'NEW_USER_JOIN_SCENE',
                    data: data
                });
            }
        };

        socket.on(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, this.listener);
    }

    /**
     * Desactiva el buffer y devuelve todos los eventos capturados
     * @returns {Array} Array de eventos capturados
     */
    deactivateAndFlush() {
        if (!this.isActive) {
            return [];
        }

        this.isActive = false;

        // Remover el listener temporal
        if (this.listener) {
            socket.off(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, this.listener);
            this.listener = null;
        }

        // Devolver copia del buffer y limpiar
        const events = [...this.buffer];
        this.buffer = [];
        return events;
    }

    /**
     * Limpia el buffer sin procesar eventos
     */
    clear() {
        this.isActive = false;
        this.buffer = [];
        
        if (this.listener) {
            socket.off(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, this.listener);
            this.listener = null;
        }
    }
}

// Exportar instancia singleton
export default new EarlyEventBuffer();
