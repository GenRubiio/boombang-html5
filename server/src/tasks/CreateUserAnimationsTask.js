const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sizeOf = require('image-size');

class CreateUserAnimationsTask {
    static async main(userId, avatarId, avatarColors) {
        await this.createWalkAnimations(userId, avatarId, avatarColors);
        await this.createInteractionAnimations(userId, avatarId, avatarColors);
    }

    static async createWalkAnimations(userId, avatarId, avatarColors) {
        const animation = 'walk';
        // Configuración de carpeta base
        const baseDir = path.join(__dirname, '../../assets/animations/avatars/' + avatarId + '/' + animation);
        await this.createAnimation(baseDir, userId, avatarColors, animation);
    }

    static async createInteractionAnimations(userId, avatarId, avatarColors) {
        const animation = 'interactions';
        // Configuración de carpeta base
        const baseDir = path.join(__dirname, '../../assets/animations/avatars/' + avatarId + '/' + animation);
        await this.createAnimation(baseDir, userId, avatarColors, animation);
    }

    static async createAnimation(baseDir, userId, avatarColors, animation) {
        // Función de comparación para ordenar nombres correctamente
        const naturalSort = (a, b) => {
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        };

        // Obtener el primer archivo PNG en una carpeta
        const getFirstPngFile = (dirPath) => {
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                if (path.extname(file).toLowerCase() === '.png') {
                    return path.join(dirPath, file);
                }
            }
            return null;
        };

        // Calcular el tamaño máximo por carpeta
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

        // Crear un collage por carpeta
        const createCollage = async (buffers, width, height) => {
            return sharp({
                create: {
                    width: width * buffers.length,
                    height: height,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                }
            })
                .composite(buffers.map((buffer, index) => ({
                    input: buffer,
                    top: 0,
                    left: index * width
                })))
                .png()
                .toBuffer();
        };

        // Procesar todas las carpetas y generar imágenes individuales
        const processFolders = async () => {
            const folders = fs.readdirSync(baseDir).sort(naturalSort);
            const outputDir = path.join(__dirname, '../../assets/users/' + userId + '/animations/' + animation);

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            for (const folder of folders) {
                const folderPath = path.join(baseDir, folder);

                if (fs.statSync(folderPath).isDirectory()) {
                    //console.log(`Procesando carpeta: ${folder}`);
                    const files = await fs.promises.readdir(folderPath);
                    const svgFiles = files.filter(file => file.endsWith('.svg')).sort(naturalSort);

                    if (svgFiles.length === 0) {
                        //console.error(`No se encontraron archivos SVG en la carpeta "${folder}"`);
                        continue;
                    }

                    const { maxWidth, maxHeight } = calculateMaxDimensions(folderPath);
                    const buffers = [];

                    for (const file of svgFiles) {
                        const inputPath = path.join(folderPath, file);

                        // Leer el SVG como texto
                        let svgContent = await fs.promises.readFile(inputPath, 'utf8');

                        // Reemplazar colores en el SVG según avatarColors
                        if (Array.isArray(avatarColors)) {
                            for (const colorChange of avatarColors) {
                                const searchColor = colorChange.color_search.startsWith('#')
                                    ? colorChange.color_search
                                    : '#' + colorChange.color_search;
                                const newColor = colorChange.new_color.startsWith('#')
                                    ? colorChange.new_color
                                    : '#' + colorChange.new_color;
                                const regex = new RegExp(searchColor, 'gi');
                                svgContent = svgContent.replace(regex, newColor);
                            }
                        }

                        let image = sharp(Buffer.from(svgContent));

                        if (folder.toLowerCase().includes('idle')) {
                            //console.log(`Aplicando trim a archivo en carpeta "idle": ${file}`);
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
                            //console.log(`La carpeta "${folder}" contiene "right", girando imagen horizontalmente.`);
                            buffer = await sharp(buffer).flop().toBuffer();
                        }

                        buffers.push(buffer);
                    }

                    const collageBuffer = await createCollage(buffers, maxWidth, maxHeight);
                    const outputPath = path.join(outputDir, `${folder}.png`);
                    await fs.promises.writeFile(outputPath, collageBuffer);
                    //console.log(`Imagen guardada: ${outputPath}`);
                }
            }
        };

        await processFolders();
    }
}

module.exports = CreateUserAnimationsTask;
