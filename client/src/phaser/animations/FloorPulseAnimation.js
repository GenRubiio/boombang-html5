class FloorPulseAnimation {
    static main(scene, x, y) {
        // Crear un gráfico de óvalo negro transparente
        const pulse = scene.add.graphics();
        pulse.fillStyle(0x000000, 0.3); // Negro transparente con menos opacidad
        pulse.fillEllipse(0, 0, 20 * 2, 10 * 2); // Tamaño inicial pequeño escalado por 2

        // Configurar la posición
        pulse.setPosition(x, y);
        pulse.setDepth(100); // Asegurarse de que esté encima de otros elementos

        // Crear la animación de expansión y desvanecimiento
        scene.tweens.add({
            targets: pulse,
            scaleX: 1.5,  // Expansión moderada
            scaleY: 1.2,  // Expansión moderada
            alpha: 0,    // Desvanece
            duration: 300, // Duración rápida
            ease: "Cubic.easeOut",
            onComplete: () => {
                pulse.destroy(); // Eliminar después de la animación
            },
        });
    }
}

export default FloorPulseAnimation;