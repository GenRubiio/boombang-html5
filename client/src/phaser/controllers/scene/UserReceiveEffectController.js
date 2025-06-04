class UserReceiveEffectController {
    static main(gameScene, data) {
        const user = gameScene.users[data.user_socket];
        if (!user) return;
        switch (data.effect) {
            case 'coco_garbage':
                this.#playCocoGarbageEffect(gameScene, user);
                break;
            case 'coco_piano':
                this.#playCocoPianoEffect(gameScene, user);
        }
    }

    static #playCocoGarbageEffect(gameScene, user) {
        let sprite = user.spriteAvatar;
        const container = sprite.parentContainer;

        // Crear sprite del efecto en la posición deseada
        const effect = gameScene.add.sprite(
            container.x + 55,
            container.y - 680,
            'coco_garbage'
        );

        // Asegurarte de que el efecto esté por encima del avatar
        effect.setDepth(container.depth);

        // Reproducir la animación
        effect.play('coco_garbage');

        // Destruir el sprite del efecto cuando termine la animación
        effect.once('animationcomplete', () => {
            effect.destroy();
        });

        // 2 segundos después de lanzar el efecto, ocultar el avatar
        gameScene.time.delayedCall(3800, () => {
            // Si tu avatar está dentro de un container:
            container.setVisible(false);
            // Si en lugar de un container quieres ocultar solo el sprite:
            // sprite.setVisible(false);
        });

        // 4 segundos después de lanzar el efecto (es decir, 2 segundos tras ocultarlo), volver a mostrar el avatar
        gameScene.time.delayedCall(7200, () => {
            container.setVisible(true);
            // o sprite.setVisible(true);
        });
    }

    static #playCocoPianoEffect(gameScene, user) {
        let sprite = user.spriteAvatar;
        const container = sprite.parentContainer;

        // Crear sprite del efecto en la posición deseada
        const effect = gameScene.add.sprite(
            container.x + 25,
            container.y - 760,
            'coco_piano'
        );

        // Asegurarte de que el efecto esté por encima del avatar
        effect.setDepth(container.depth);

        // Reproducir la animación
        effect.play('coco_piano');

        // Destruir el sprite del efecto cuando termine la animación
        effect.once('animationcomplete', () => {
            effect.destroy();
        });

        // 2 segundos después de lanzar el efecto, ocultar el avatar
        gameScene.time.delayedCall(1500, () => {
            container.setVisible(false);
        });

        // 4 segundos después de lanzar el efecto (es decir, 2 segundos tras ocultarlo), volver a mostrar el avatar
        gameScene.time.delayedCall(13300, () => {
            container.setVisible(true);
        });
    }
}

export default UserReceiveEffectController;
