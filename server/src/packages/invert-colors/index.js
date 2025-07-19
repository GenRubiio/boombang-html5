const sharp = require('sharp');

/**
 * Invierte los colores de una imagen y mejora el contraste de las sombras.
 * El problema con una inversión simple (negate) es que las sombras oscuras se convierten
 * en sombras muy claras, perdiendo contraste con el fondo blanco.
 *
 * Para solucionarlo, después de invertir los colores, aplicamos una corrección gamma.
 * Un valor de gamma > 1 oscurece la imagen, pero afecta más a los tonos medios (nuestras
 * sombras invertidas), haciéndolas más oscuras y visibles contra el fondo.
 *
 * Puedes experimentar con el valor de gamma (por ejemplo, entre 1.5 y 2.5) para
 * obtener el resultado deseado.
 *
 * @param {string} inputPath - Ruta de la imagen de entrada.
 * @param {string} outputPath - Ruta para guardar la imagen de salida.
 * @param {number} gammaValue - El valor para la corrección gamma.
 */
async function invertirConMejora(inputPath, outputPath, gammaValue = 2.2) {
  try {
    await sharp(inputPath)
      .negate({ alpha: false }) // Invierte los colores (negro -> blanco, gris oscuro -> gris claro)
      .gamma(gammaValue)      // Oscurece la imagen para que las sombras claras resalten
      .toFile(outputPath);

    console.log(`Imagen invertida y corregida guardada en: ${outputPath}`);
  } catch (error) {
    console.error('Ocurrió un error durante la inversión:', error);
  }
}

// Ejecutamos la función con la imagen de entrada y una nueva de salida.
// Se generará un archivo 'salida.png' para que puedas comparar.
invertirConMejora('entrada.png', 'salida.png')
  .then(() => console.log('Proceso completado.'))
  .catch(console.error);
