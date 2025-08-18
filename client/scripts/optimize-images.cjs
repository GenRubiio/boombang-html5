const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = path.resolve(__dirname, '../src/assets/game');
const supportedExtensions = ['.png', '.jpg'];

async function processImage(filePath) {
  try {
    const originalExtension = path.extname(filePath);
    const fileName = path.basename(filePath, originalExtension);
    const dirName = path.dirname(filePath);

    const webpPath = path.join(dirName, `${fileName}.webp`);
    const oldImagePath = path.join(dirName, `${fileName}_old${originalExtension}`);

    console.log(`Processing: ${filePath}`);

    // Convert to webp
    await sharp(filePath)
      .webp({ quality: 100 })
      .toFile(webpPath);

    console.log(`  -> Converted to: ${webpPath}`);

    // Rename old file
    fs.renameSync(filePath, oldImagePath);
    console.log(`  -> Renamed original to: ${oldImagePath}`);

  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

async function traverseDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (path.basename(fullPath) === 'avatars') {
        console.log(`Skipping directory: ${fullPath}`);
        continue;
      }
      await traverseDirectory(fullPath);
    } else {
      const extension = path.extname(file).toLowerCase();
      if (supportedExtensions.includes(extension)) {
        await processImage(fullPath);
      }
    }
  }
}

(async () => {
  console.log('Starting image optimization process...');
  await traverseDirectory(sourceDir);
  console.log('Image optimization complete.');
})();
