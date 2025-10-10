class SceneMutex {
    constructor() {
        this.locks = new Map(); // sceneId -> Promise
        this.queues = new Map(); // sceneId -> Array of resolvers
    }

    async acquire(sceneId) {
        // Si no hay lock para esta escena, crear uno inmediatamente
        if (!this.locks.has(sceneId)) {
            const resolver = { resolve: null, promise: null };
            resolver.promise = new Promise(resolve => {
                resolver.resolve = resolve;
            });
            this.locks.set(sceneId, resolver.promise);
            return resolver.resolve;
        }

        // Si ya hay un lock, esperar en cola
        const currentLock = this.locks.get(sceneId);
        
        return new Promise((resolve) => {
            if (!this.queues.has(sceneId)) {
                this.queues.set(sceneId, []);
            }
            this.queues.get(sceneId).push(resolve);
            
            // Cuando el lock actual se libere, procesar la cola
            currentLock.then(() => {
                const queue = this.queues.get(sceneId);
                if (queue && queue.length > 0) {
                    const nextResolver = queue.shift();
                    
                    // Crear nuevo lock para el siguiente en la cola
                    const newResolver = { resolve: null, promise: null };
                    newResolver.promise = new Promise(resolve => {
                        newResolver.resolve = resolve;
                    });
                    this.locks.set(sceneId, newResolver.promise);
                    
                    // Dar el control al siguiente
                    nextResolver(newResolver.resolve);
                } else {
                    // No hay más en cola, limpiar
                    this.locks.delete(sceneId);
                    this.queues.delete(sceneId);
                }
            });
        });
    }
}

// Singleton global para toda la aplicación
const sceneMutex = new SceneMutex();

module.exports = sceneMutex;