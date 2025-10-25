import socket from '@/sockets/socket';
import ResponseSocketsEnum from '@/enums/ResponseSocketsEnum';
import RequestSocketsEnum from '@/enums/RequestSocketsEnum';

class SocketDebugUtil {
    /**
     * Obtiene todos los eventos conocidos del sistema
     */
    static getAllKnownEvents() {
        const responseEvents = Object.values(ResponseSocketsEnum);
        const requestEvents = Object.values(RequestSocketsEnum);
        const systemEvents = ['connect', 'disconnect', 'connect_error', 'reconnect', 'reconnecting'];
        
        return [...responseEvents, ...requestEvents, ...systemEvents];
    }

    /**
     * Verifica si un evento tiene listeners usando el método hasListeners
     */
    static hasListeners(eventName) {
        try {
            // Socket.IO client tiene hasListeners pero no listenerCount
            return socket.hasListeners && socket.hasListeners(eventName);
        } catch (e) {
            // Fallback: intentar agregar y remover un listener temporal para verificar
            let hasListener = false;
            const tempListener = () => {};
            
            try {
                const originalListeners = socket._callbacks && socket._callbacks[eventName] ? socket._callbacks[eventName].length : 0;
                socket.on(eventName, tempListener);
                const newListeners = socket._callbacks && socket._callbacks[eventName] ? socket._callbacks[eventName].length : 0;
                hasListener = originalListeners > 0;
                socket.off(eventName, tempListener);
            } catch (err) {
                // Si falla todo, asumimos que no hay listeners
                hasListener = false;
            }
            
            return hasListener;
        }
    }

    /**
     * Obtiene el número aproximado de listeners para un evento
     */
    static getListenerCount(eventName) {
        try {
            // Intentar acceder a los callbacks internos de Socket.IO
            if (socket._callbacks && socket._callbacks[eventName]) {
                return socket._callbacks[eventName].length;
            }
            return 0;
        } catch (e) {
            return this.hasListeners(eventName) ? 1 : 0;
        }
    }

    /**
     * Muestra todos los listeners activos en el socket
     */
    static showAllListeners() {
        console.group('🔌 Socket Listeners Debug');
        
        const knownEvents = this.getAllKnownEvents();
        const activeEvents = knownEvents.filter(event => this.hasListeners(event));
        
        console.log(`📊 Total eventos activos: ${activeEvents.length}/${knownEvents.length}`);
        
        activeEvents.forEach(eventName => {
            const count = this.getListenerCount(eventName);
            
            console.group(`📡 ${eventName} (${count} listeners)`);
            for (let i = 1; i <= count; i++) {
                console.log(`  ${i}. Listener function`);
            }
            console.groupEnd();
        });
        
        console.groupEnd();
    }

    /**
     * Verifica duplicados en eventos específicos
     */
    static checkDuplicates() {
        console.group('🔍 Checking Socket Duplicates');
        
        const duplicates = [];
        const knownEvents = this.getAllKnownEvents();
        
        knownEvents.forEach(eventName => {
            const count = this.getListenerCount(eventName);
            if (count > 1) {
                duplicates.push({
                    event: eventName,
                    count: count
                });
            }
        });
        
        if (duplicates.length > 0) {
            console.warn('⚠️ Eventos con múltiples listeners encontrados:');
            duplicates.forEach(dup => {
                console.warn(`  - ${dup.event}: ${dup.count} listeners`);
            });
        } else {
            console.log('✅ No se encontraron duplicados');
        }
        
        console.groupEnd();
        return duplicates;
    }

    /**
     * Muestra estadísticas de eventos por categoría
     */
    static showEventStats() {
        console.group('📈 Socket Event Statistics');
        
        const responseEvents = Object.values(ResponseSocketsEnum);
        const requestEvents = Object.values(RequestSocketsEnum);
        const systemEvents = ['connect', 'disconnect', 'connect_error', 'reconnect', 'reconnecting'];
        
        // Contar eventos activos por categoría
        const activeResponseEvents = responseEvents.filter(event => this.hasListeners(event));
        const activeRequestEvents = requestEvents.filter(event => this.hasListeners(event));
        const activeSystemEvents = systemEvents.filter(event => this.hasListeners(event));
        
        console.log(`📥 Response Events: ${activeResponseEvents.length}/${responseEvents.length}`);
        console.log(`📤 Request Events: ${activeRequestEvents.length}/${requestEvents.length}`);
        console.log(`🔧 System Events: ${activeSystemEvents.length}/${systemEvents.length}`);
        console.log(`📊 Total Active: ${activeResponseEvents.length + activeRequestEvents.length + activeSystemEvents.length}`);
        
        // Mostrar eventos sin listeners
        const missingResponse = responseEvents.filter(event => !this.hasListeners(event));
        const missingRequest = requestEvents.filter(event => !this.hasListeners(event));
        
        if (missingResponse.length > 0) {
            console.log('❌ Response events sin listeners:', missingResponse.slice(0, 5), missingResponse.length > 5 ? `... y ${missingResponse.length - 5} más` : '');
        }
        
        if (missingRequest.length > 0) {
            console.log('❌ Request events sin listeners:', missingRequest.slice(0, 5), missingRequest.length > 5 ? `... y ${missingRequest.length - 5} más` : '');
        }
        
        console.groupEnd();
    }

    /**
     * Monitorea cambios en los listeners en tiempo real
     */
    static startListenerMonitoring() {
        const knownEvents = this.getAllKnownEvents();
        let lastCount = knownEvents.filter(event => this.hasListeners(event)).length;
        
        const monitor = setInterval(() => {
            const knownEvents = this.getAllKnownEvents();
            const currentCount = knownEvents.filter(event => this.hasListeners(event)).length;
            if (currentCount !== lastCount) {
                console.log(`🔄 Listeners changed: ${lastCount} → ${currentCount}`);
                this.checkDuplicates();
                lastCount = currentCount;
            }
        }, 1000);
        
        console.log('🎯 Listener monitoring started');
        return monitor; // Retorna el interval ID para poder pararlo
    }

    /**
     * Limpia listeners duplicados de un evento específico
     */
    static removeDuplicateListeners(eventName) {
        const count = socket.listenerCount(eventName);
        if (count > 1) {
            console.log(`🧹 Cleaning ${count} listeners from ${eventName}`);
            socket.removeAllListeners(eventName);
            return true;
        }
        return false;
    }

    /**
     * Ejecuta una auditoría completa
     */
    static fullAudit() {
        console.group('🔍 Full Socket Audit');
        this.showEventStats();
        this.checkDuplicates();
        this.showAllListeners();
        console.groupEnd();
    }
}

// Hacer disponible globalmente en desarrollo
if (import.meta.env.VITE_APP_ENV === "local") {
    window.SocketDebugUtil = SocketDebugUtil;
}

export default SocketDebugUtil;
