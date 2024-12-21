const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sizeOf = require('image-size');


class CreateUserAnimationsAtlasTask {
    static MAX_ATLAS_WIDTH = 4096;
    static MAX_ATLAS_HEIGHT = 4096;

    /**
     * Punto de entrada principal. 
     * Llama a createAnimation con la carpeta 'walk' (ajusta a tu gusto).
     * Si quieres empacar 'interactions' + 'walk' en 1 solo atlas,
     * tendrías que unificarlos en la misma carpeta o concatenar frames.
     */
    static async main(userId, avatarId, avatarColors) {
        await this.createWalkAnimations(userId, avatarId, avatarColors);
        await this.createInteractionsAnimations(userId, avatarId, avatarColors, 'punch_doy');
        await this.createInteractionsAnimations(userId, avatarId, avatarColors, 'punch_rec');
    }

    static async createInteractionsAnimations(userId, avatarId, avatarColors, animation) {
        // Convertimos avatarId a string para evitar error en path.join
        const baseDir = path.join(__dirname, '../../assets/animations/avatars', String(avatarId) + "/interactions", animation);

        // Directorio de salida (userId también a string)
        const outputDir = path.join(__dirname, '../../assets/users', String(userId), 'animations', animation);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 1) Obtenemos todos los frames de todas las subcarpetas
        const allFrames = await this.collectAllFrames(baseDir, avatarColors);

        // 2) Empacamos todos esos frames en un solo atlas
        await this.packAllFramesIntoSingleAtlas(allFrames, outputDir, animation);
    }

    /**
     * Procesa la animación "walk" generando un único atlas 
     * (1 PNG + 1 JSON) con TODOS los frames de sus subcarpetas.
     */
    static async createWalkAnimations(userId, avatarId, avatarColors) {
        const animation = 'walk';
        // Convertimos avatarId a string para evitar error en path.join
        const baseDir = path.join(__dirname, '../../assets/animations/avatars', String(avatarId), animation);

        // Directorio de salida (userId también a string)
        const outputDir = path.join(__dirname, '../../assets/users', String(userId), 'animations', animation);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 1) Obtenemos todos los frames de todas las subcarpetas
        const allFrames = await this.collectAllFrames(baseDir, avatarColors);

        // 2) Empacamos todos esos frames en un solo atlas
        await this.packAllFramesIntoSingleAtlas(allFrames, outputDir, animation);
    }

    /**
     * Lee todas las subcarpetas de 'baseDir', busca .svg, 
     * los convierte a PNG con color replacement y los acumula en un array.
     */
    static async collectAllFrames(baseDir, avatarColors) {
        const allFrames = [];
        const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

        const folders = fs.readdirSync(baseDir).sort(naturalSort);

        for (const folder of folders) {
            const folderPath = path.join(baseDir, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue;

            const files = fs.readdirSync(folderPath).sort(naturalSort);
            const svgFiles = files.filter(file => file.toLowerCase().endsWith('.svg'));
            if (svgFiles.length === 0) continue;

            // Averiguamos el tamaño base (maxWidth, maxHeight) usando el primer .png que haya en la carpeta
            const { maxWidth, maxHeight } = this.calculateMaxDimensions(folderPath);
            if (maxWidth === 0 || maxHeight === 0) continue;

            for (const svgFile of svgFiles) {
                const svgPath = path.join(folderPath, svgFile);
                const frameInfo = await this.convertSvgToFrame({
                    folder,
                    svgPath,
                    svgFile,
                    avatarColors,
                    maxWidth,
                    maxHeight
                });
                if (frameInfo) {
                    allFrames.push(frameInfo);
                }
            }
        }

        return allFrames;
    }

    /**
     * A partir de un archivo .svg, aplica color replacement, 
     * redimensiona a maxWidth x maxHeight, voltea si es "right", etc.
     * Retorna un objeto con { name, buffer, w, h } para luego empacar.
     */
    static async convertSvgToFrame({ folder, svgPath, svgFile, avatarColors, maxWidth, maxHeight }) {
        try {
            let svgContent = await fs.promises.readFile(svgPath, 'utf8');

            // Remplazo de colores
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

            // Opcional: si la carpeta se llama "idle" algo, hacemos trim
            if (folder.toLowerCase().includes('idle')) {
                image = image.trim();
            }

            // Redimensionamos al tamaño deseado
            let buffer = await image
                .resize(maxWidth, maxHeight, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png()
                .toBuffer();

            // Si el folder tiene "right" en el nombre, volteamos horizontalmente
            if (folder.toLowerCase().includes('right')) {
                buffer = await sharp(buffer).flop().toBuffer();
            }

            // Nombre del frame => "folder_frameName" (p.ej. "down_frame0")
            const frameName = `${folder}_${svgFile.replace('.svg', '')}`;

            return {
                name: frameName,
                buffer,
                w: maxWidth,
                h: maxHeight
            };
        } catch (error) {
            console.error('Error convertSvgToFrame:', svgFile, error);
            return null;
        }
    }

    /**
     * Empaca TODOS los frames en un **solo** PNG + JSON.
     * Si no caben en 4096x4096, lanza un error (puedes ajustarlo a tu gusto).
     */
    static async packAllFramesIntoSingleAtlas(allFrames, outputDir, animation) {
        // Ordenar frames como quieras (generalmente no importa para un sprite atlas)
        // Ejemplo: allFrames.sort((a, b) => a.name.localeCompare(b.name));

        let currentX = 0;
        let currentY = 0;
        let maxRowHeight = 0;

        // Esto almacenará la posición final de cada frame en la "lona"
        const placedFrames = [];

        // 1) Colocar cada frame en la "lona" de 4096x4096 
        //    (estilo bin packing muy básico: por filas).
        for (const f of allFrames) {
            // Si no cabe en esta fila, saltamos a la siguiente
            if (currentX + f.w > this.MAX_ATLAS_WIDTH) {
                currentX = 0;
                currentY += maxRowHeight;
                maxRowHeight = 0;
            }

            // Si tampoco cabe verticalmente => error, porque queremos 1 solo PNG
            if (currentY + f.h > this.MAX_ATLAS_HEIGHT) {
                throw new Error(
                    `No cabe todo en 1 solo PNG de 4096x4096. Frame ${f.name} excede el límite. Debes usar múltiples atlases o agrandar MAX_ATLAS_WIDTH/HEIGHT.`
                );
            }

            // Guardamos la posición
            placedFrames.push({
                name: f.name,
                buffer: f.buffer,
                x: currentX,
                y: currentY,
                w: f.w,
                h: f.h
            });

            currentX += f.w;
            maxRowHeight = Math.max(maxRowHeight, f.h);
        }

        // 2) Determinamos el ancho y alto final
        const atlasWidth = placedFrames.reduce((acc, frame) => Math.max(acc, frame.x + frame.w), 0);
        const atlasHeight = placedFrames.reduce((acc, frame) => Math.max(acc, frame.y + frame.h), 0);

        // 3) Componemos la imagen final
        const composite = placedFrames.map(frame => ({
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

        // 4) Guardamos el PNG en disco
        const atlasFileName = `${animation}_singleAtlas.png`;
        const atlasFilePath = path.join(outputDir, atlasFileName);
        await fs.promises.writeFile(atlasFilePath, atlasBuffer);

        // 5) Creamos el JSON
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

        for (const frame of placedFrames) {
            json.frames[frame.name] = {
                frame: {
                    x: frame.x,
                    y: frame.y,
                    w: frame.w,
                    h: frame.h
                }
            };
        }

        const jsonFileName = `${animation}_singleAtlas.json`;
        const jsonFilePath = path.join(outputDir, jsonFileName);
        await fs.promises.writeFile(jsonFilePath, JSON.stringify(json, null, 2));

        console.log(`Atlas generado: ${atlasFileName}`);
        console.log(`JSON generado:  ${jsonFileName}`);
    }

    /**
     * Busca el primer .png de la carpeta para determinar su ancho/alto,
     * según tu flujo de archivos. Ajusta si tus .svg tienen tamaños diferentes.
     */
    static calculateMaxDimensions(folderPath) {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
            if (path.extname(file).toLowerCase() === '.png') {
                const { width, height } = sizeOf(path.join(folderPath, file));
                return { maxWidth: width, maxHeight: height };
            }
        }
        return { maxWidth: 0, maxHeight: 0 };
    }
}

module.exports = CreateUserAnimationsAtlasTask;