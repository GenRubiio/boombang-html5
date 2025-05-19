import { defineStore } from 'pinia'

export const useNpcSubscriptionStore = defineStore('npcSubscription', {
    state: () => ({
        // mapeo npcId → inscrito (true/false)
        inscritos: {}
    }),
    getters: {
        // devuelve true/false si un npc está inscrito
        isSubscribed: (state) => {
            return (npcId) => !!state.inscritos[npcId]
        }
    },
    actions: {
        // suscribe al NPC
        subscribe(npcId) {
            this.inscritos = { ...this.inscritos, [npcId]: true }
        },
        // da de baja al NPC
        unsubscribe(npcId) {
            // eliminamos la clave o la ponemos a false
            const { [npcId]: _, ...rest } = this.inscritos
            this.inscritos = rest
        },
        // alterna el estado
        toggle(npcId) {
            if (this.isSubscribed(npcId)) {
                this.unsubscribe(npcId)
            } else {
                this.subscribe(npcId)
            }
        }
    },
    persist: {
        enabled: true,
        strategies: [
            { storage: localStorage, paths: ['inscritos'] }
        ]
    }
})
