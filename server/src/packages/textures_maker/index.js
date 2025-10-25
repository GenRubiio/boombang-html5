const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const animationsDir = 'C:\\Users\\evgeny.lyubeznyy\\Desktop\\boombang animations';
const outputDir = 'C:\\Users\\evgeny.lyubeznyy\\Desktop\\textures_maker_png_test';

async function processImages() {
    try {
        // Create the main output directory if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });

        const subDirs = await fs.readdir(animationsDir, { withFileTypes: true });

        for (const subDir of subDirs) {
            if (subDir.isDirectory()) {
                const characterDir = path.join(animationsDir, subDir.name);
                const outputCharacterDir = path.join(outputDir, subDir.name);

                // Create corresponding character directory in output
                await fs.mkdir(outputCharacterDir, { recursive: true });

                console.log(`Processing character: ${subDir.name}`);

                // Get animation subdirectories (like down_idle, left_walk, etc.)
                const animationDirs = await fs.readdir(characterDir, { withFileTypes: true });

                for (const animationDir of animationDirs) {
                    if (animationDir.isDirectory()) {
                        const animationPath = path.join(characterDir, animationDir.name);
                        const outputAnimationPath = path.join(outputCharacterDir, animationDir.name);

                        // Create corresponding animation directory in output
                        await fs.mkdir(outputAnimationPath, { recursive: true });

                        console.log(`  Processing animation: ${animationDir.name}`);

                        const files = await fs.readdir(animationPath);
                        const svgFiles = files.filter(file => path.extname(file).toLowerCase() === '.svg');

                        for (const svgFile of svgFiles) {
                            const svgPath = path.join(animationPath, svgFile);
                            const pngPath = path.join(outputAnimationPath, `${path.basename(svgFile, '.svg')}.png`);

                            try {
                                // For SVGs, resizing is best handled by increasing the density (DPI)
                                // as many SVGs don't have explicit pixel dimensions.
                                // A standard DPI is 72, so we'll use 144 for double size.
                                await sharp(svgPath, { density: 144 })
                                    .png()
                                    .toFile(pngPath);
                                console.log(`    - Converted ${svgFile} to ${path.basename(pngPath)}`);

                            } catch (err) {
                                console.error(`Error processing file ${svgPath}:`, err);
                            }
                        }
                    }
                }
            }
        }
        console.log(`\nProcessing complete! Check the '${path.basename(outputDir)}' directory.`);
    } catch (err) {
        console.error('An error occurred:', err);
    }
}

processImages();
