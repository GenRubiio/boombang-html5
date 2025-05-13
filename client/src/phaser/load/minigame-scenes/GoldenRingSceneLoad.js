class GoldenRingSceneLoad {
    static main(gameScene) {
        this.loadBackground(gameScene);
        //this.loadDecorations(gameScene);
    }

    static loadBackground(gameScene) {
        const background = gameScene.add.image(0, 0, "background_golden_ring").setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
    }

    static loadDecorations(gameScene) {
        /********************************************************
         * 1) Item en coordenadas absolutas (por encima de todo)
         *    Útil para decoración UI / adorno en pantalla
         ********************************************************/
        const itemAbsolute = gameScene.add.image(0, 0, "item_2");
        itemAbsolute.setOrigin(0, 0); // ancla en la esquina sup. izq.
        itemAbsolute.setDepth(9999);  // muy alto => se ve arriba de todo
        // No se escala, conserva tamaño original.


        /********************************************************
         * 2) Item en el mundo isométrico (sin escalarlo a "rombo")
         *    Se comporta igual que un mueble o árbol grande.
         ********************************************************/
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = gameScene.scale.width / 2;

        // Ejemplo: lo ponemos en col=8, row=4 del mapa isométrico
        const col = 8;
        const row = 4;
        const x = (col - row) * halfTileWidth + centerX + 40;
        const y = (col + row) * halfTileHeight + 253;

        // Creamos la imagen sin redimensionar
        const itemIso = gameScene.add.image(x, y, "item_1");
        // Anclamos al centro/base para que su “pie” quede en el tile isométrico
        itemIso.setOrigin(0.5, 1);
        
        // Para que se solape correctamente con jugadores/tiles,
        // asignamos la profundidad según la Y
        itemIso.setDepth(y);

        // También lo hacemos clicable para voltearlo
    }
}

export default GoldenRingSceneLoad;