const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sizeOf = require('image-size');

class CreateUserAnimationsAtlasTask {
    static MAX_ATLAS_WIDTH = 4096;
    static MAX_ATLAS_HEIGHT = 4096;

    static async main(userId, avatarId, avatarColors) {
        await this.createWalkAnimations(userId, avatarId, avatarColors);
        await this.createInteractionAnimations(userId, avatarId, avatarColors);
    }

    static async createWalkAnimations(userId, avatarId, avatarColors) {
        const animation = 'walk';
        const baseDir = path.join(__dirname, '../../assets/animations/avatars/' + avatarId + '/' + animation);
        await this.createAnimation(baseDir, userId, avatarColors, animation);
    }

    static async createInteractionAnimations(userId, avatarId, avatarColors) {
        const animation = 'interactions';
        const baseDir = path.join(__dirname, '../../assets/animations/avatars/' + avatarId + '/' + animation);
        await this.createAnimation(baseDir, userId, avatarColors, animation);
    }

    static async createAnimation(baseDir, userId, avatarColors, animation) {
        const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

        const getFirstPngFile = (dirPath) => {
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                if (path.extname(file).toLowerCase() === '.png') {
                    return path.join(dirPath, file);
                }
            }
            return null;
        };

        const calculateMaxDimensions = (folderPath) => {
            let maxWidth = 0;
            let maxHeight = 0;
            const firstPng = getFirstPngFile(folderPath);
            if (firstPng) {
                const { width, height } = sizeOf(firstPng);
                maxWidth = width;
                maxHeight = height;
            }
            return { maxWidth, maxHeight };
        };

        const folders = fs.readdirSync(baseDir).sort(naturalSort);
        const outputDir = path.join(__dirname, '../../assets/users/' + userId + '/animations/' + animation);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        for (const folder of folders) {
            const folderPath = path.join(baseDir, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue;

            const files = await fs.promises.readdir(folderPath);
            const svgFiles = files.filter(file => file.endsWith('.svg')).sort(naturalSort);
            if (svgFiles.length === 0) continue;

            const { maxWidth, maxHeight } = calculateMaxDimensions(folderPath);
            if (maxWidth === 0 || maxHeight === 0) continue;

            const frameBuffers = [];
            for (const file of svgFiles) {
                const inputPath = path.join(folderPath, file);
                let svgContent = await fs.promises.readFile(inputPath, 'utf8');

                if (Array.isArray(avatarColors)) {
                    for (const colorChange of avatarColors) {
                        const searchColor = colorChange.color_search.startsWith('#') ? colorChange.color_search : '#' + colorChange.color_search;
                        const newColor = colorChange.new_color.startsWith('#') ? colorChange.new_color : '#' + colorChange.new_color;
                        const regex = new RegExp(searchColor, 'gi');
                        svgContent = svgContent.replace(regex, newColor);
                    }
                }

                let image = sharp(Buffer.from(svgContent));

                if (folder.toLowerCase().includes('idle')) {
                    image = image.trim();
                }

                let buffer = await image
                    .resize(maxWidth, maxHeight, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .png()
                    .toBuffer();

                if (folder.toLowerCase().includes('right')) {
                    buffer = await sharp(buffer).flop().toBuffer();
                }

                frameBuffers.push({ name: file.replace('.svg', ''), buffer });
            }

            let atlasIndex = 0;
            let framesInAtlas = [];
            let currentX = 0;
            let currentY = 0;
            let maxRowHeight = 0;

            const atlasData = [];

            const flushAtlas = async () => {
                if (framesInAtlas.length === 0) return;
                const atlasWidth = framesInAtlas.reduce((acc, f) => Math.max(acc, f.x + f.w), 0);
                const atlasHeight = framesInAtlas.reduce((acc, f) => Math.max(acc, f.y + f.h), 0);

                const composite = framesInAtlas.map(frame => ({
                    input: frame.buffer,
                    top: frame.y,
                    left: frame.x
                }));

                const atlasBuffer = await sharp({
                    create: {
                        width: atlasWidth,
                        height: atlasHeight,
                        channels: 4,
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    }
                })
                .composite(composite)
                .png()
                .toBuffer();

                const atlasFileName = `${folder}_atlas_${atlasIndex}.png`;
                const atlasFilePath = path.join(outputDir, atlasFileName);
                await fs.promises.writeFile(atlasFilePath, atlasBuffer);

                const json = {
                    frames: {},
                    meta: {
                        app: "Custom Sprite Generator",
                        version: "1.0",
                        image: atlasFileName,
                        format: "RGBA8888",
                        size: { w: atlasWidth, h: atlasHeight },
                        scale: "1"
                    }
                };

                for (const f of framesInAtlas) {
                    json.frames[f.name] = {
                        frame: { x: f.x, y: f.y, w: f.w, h: f.h }
                    };
                }

                const jsonFileName = `${folder}_atlas_${atlasIndex}.json`;
                const jsonFilePath = path.join(outputDir, jsonFileName);
                // await fs.promises.writeFile(jsonFilePath, JSON.stringify(json, null, 2));

                atlasData.push({ image: atlasFileName, json: jsonFileName });

                framesInAtlas = [];
                currentX = 0;
                currentY = 0;
                maxRowHeight = 0;
                atlasIndex++;
            };

            for (const f of frameBuffers) {
                if (currentX + maxWidth > this.MAX_ATLAS_WIDTH) {
                    currentX = 0;
                    currentY += maxRowHeight;
                    maxRowHeight = 0;
                }

                if (currentY + maxHeight > this.MAX_ATLAS_HEIGHT) {
                    await flushAtlas();
                }

                framesInAtlas.push({
                    name: f.name,
                    buffer: f.buffer,
                    x: currentX,
                    y: currentY,
                    w: maxWidth,
                    h: maxHeight
                });

                currentX += maxWidth;
                maxRowHeight = Math.max(maxRowHeight, maxHeight);
            }

            await flushAtlas();
            // const indexJsonFile = path.join(outputDir, `${folder}_atlas_index.json`); // await fs.promises.writeFile(indexJsonFile, JSON.stringify(atlasData, null, 2));
        }
    }
}

module.exports = CreateUserAnimationsAtlasTask;
