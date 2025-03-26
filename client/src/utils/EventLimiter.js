class EventLimiter {
    static lastClickTime = 0;
    static cooldown = 300; // Tiempo en milisegundos entre clics

    static canClick() {
        const now = Date.now();
        if (now - this.lastClickTime > this.cooldown) {
            this.lastClickTime = now;
            return true;
        }
        return false;
    }
}

export default EventLimiter;