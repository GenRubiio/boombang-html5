const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, 'input');
const outputDir = path.join(__dirname, 'output');

async function convertImages() {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Read all files from the input directory
    const files = await fs.readdir(inputDir);

    // Filter for .png files
    const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');

    if (pngFiles.length === 0) {
      console.log('No PNG files found in the input directory.');
      return;
    }

    console.log(`Found ${pngFiles.length} PNG file(s) to convert.`);

    // Process each PNG file
    for (const file of pngFiles) {
      const inputPath = path.join(inputDir, file);
      const outputFileName = `${path.basename(file, path.extname(file))}.webp`;
      const outputPath = path.join(outputDir, outputFileName);

      console.log(`Converting ${file} to ${outputFileName}...`);

      await sharp(inputPath)
        .webp({ lossless: true }) // Convert to WebP without quality loss
        .toFile(outputPath);

      console.log(`Successfully converted ${file} and saved to ${outputPath}`);
    }

    console.log('\nAll conversions complete!');

  } catch (error) {
    console.error('An error occurred during the conversion process:', error);
  }
}

convertImages();