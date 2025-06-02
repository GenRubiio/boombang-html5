// TintManager.js
export default class TintManager {
    static UPPERCUT = {
        RED: 0, PINK: 1, ORANGE: 2, GREEN: 3,
        BLUE: 4, WHITE: 5, PURPLE: 6, BROWN: 7,
        BLACK: 8, GOLD: 9
    };

    static COLOR_HEX = {
        [0]: 0xff0000, [1]: 0xffc0cb, [2]: 0xffa500,
        [3]: 0x00ff00, [4]: 0x0000ff, [5]: 0xffffff,
        [6]: 0x800080, [7]: 0x8b4513, [8]: 0x000000,
        [9]: 0xffd700
    };

    constructor(scene) {
        this.plugin = scene.plugins.get('rexColorReplacePipeline');
        // sprite → Map(partKey → Array<{origHex,newHex,pipe}>)
        this._registry = new WeakMap();
    }

    _getPipelines(sprite, partKey) {
        let parts = this._registry.get(sprite);
        if (!parts) {
            parts = new Map();
            this._registry.set(sprite, parts);
        }
        let arr = parts.get(partKey);
        if (!arr) {
            arr = [];
            parts.set(partKey, arr);
        }
        return arr;
    }

    // TintManager.js (añade esto tras changeUppercutColor)

    /**
     * Aplica un cambio de color encadenando un pipeline nuevo
     * en la parte que tú elijas (p.ej. 'skin', 'hair', 'torso').
     *
     * @param {Phaser.GameObjects.Sprite} sprite
     * @param {string} partKey       Nombre de la zona (e.g. 'skin')
     * @param {number} originalHex   Color previo en 0xRRGGBB
     * @param {number} newHex        Color destino en 0xRRGGBB
     * @param {number} [epsilon=0]   Sensibilidad al matiz
     */
    replaceColor(sprite, partKey, originalHex, newHex, epsilon = 0) {
        // Reutiliza el mismo arreglo de pipelines:
        const arr = this._getPipelines(sprite, partKey);
        // Si ya hay alguno, toma su newHex como orig para este ciclo
        if (arr.length > 0) {
            originalHex = arr[arr.length - 1].newHex;
        }
        // Añade un pipeline que convierta originalHex → newHex
        this.addReplacement(sprite, partKey, originalHex, newHex, epsilon);
    }

    /**
     * Añade un pipeline que convierta origHex→newHex y lo encadena.
     */
    addReplacement(sprite, partKey, origHex, newHex, epsilon = 0) {
        const arr = this._getPipelines(sprite, partKey);
        const pipe = this.plugin.add(sprite, {
            originalColor: origHex,
            newColor: newHex,
            epsilon
        });
        arr.push({ origHex, newHex, pipe });
    }

    /**
     * Aplica un cambio de uppercut encadenando un pipeline nuevo.
     * Sólo necesitas pasar el índice del nuevo color.
     */
    changeUppercutColor(sprite, newId, epsilon = 0) {
        const arr = this._getPipelines(sprite, 'uppercut');
        // Si hay al menos un pipeline, tomo el newHex de ese último
        let origHex = 0x11051C;
        if (arr.length > 0) {
            origHex = arr[arr.length - 1].newHex;
        }
        const newHex = TintManager.COLOR_HEX[newId];
        //console.log(
        //    'Uppercut:',
        //    `pipeline#${arr.length + 1}`,
        //    `${origHex.toString(16)} → ${newHex.toString(16)}`
        //);
        this.addReplacement(sprite, 'uppercut', origHex, newHex, epsilon);
    }

    /**
     * (Opcional) Elimina **todos** los pipelines de una parte
     */
    clearPart(sprite, partKey) {
        const parts = this._registry.get(sprite);
        if (!parts) return;
        // Elimina por completo el post-fx de color para este sprite
        this.plugin.remove(sprite);
        // Borra el registro interno para esa 'parte'
        parts.delete(partKey);
    }
}
