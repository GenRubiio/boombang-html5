/* index.js */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Invierte las imagenes de la carpeta input y las guarda en la carpeta output
 * aplicando una curva lineal.
 *
 * - slope: multiplicador de contraste.
 */
async function main() {
  const inputDir = path.join(__dirname, 'input');
  const outputDir = path.join(__dirname, 'output');
  const slope = 1.8;
  const offset = 0;

  if (!fs.existsSync(inputDir)) {
    console.error(`⛔ El directorio de entrada no existe: ${inputDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    const inPath = path.join(inputDir, file);
    const outPath = path.join(outputDir, file);

    try {
      const pipeline = sharp(inPath)
        .negate({ alpha: false })      // invertir colores
        .linear(slope, offset);        // ajustar contraste (sin offset)

      // .clamp() solo existe en versiones ≥0.33; lo usamos si está disponible
      if (typeof pipeline.clamp === 'function') {
        pipeline.clamp();              // recortar a 0‑255 si se puede
      }

      await pipeline.toFile(outPath);
      console.log(`✔ Imagen procesada: ${outPath}`);
    } catch (err) {
      console.error(`⛔ Error procesando la imagen ${file}:`, err);
    }
  }
}

main();