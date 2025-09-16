#!/usr/bin/env node

/**
 * Script para generar texturas pesadas del zombie para testing de rendimiento
 * 
 * Este script toma las texturas existentes del zombie y crea versiones más pesadas
 * para probar el rendimiento del juego con assets de gran tamaño.
 */

const fs = require('fs');
const path = require('path');

const ZOMBIE_ANIMATIONS_PATH = path.join(__dirname, '..', 'src', 'assets', 'game', 'avatars', 'zombie', 'animations');
const HEAVY_TESTING_PATH = path.join(ZOMBIE_ANIMATIONS_PATH, 'heavy_testing');

console.log('🧟 Generando texturas pesadas del zombie para testing de rendimiento...');

// Asegurar que existe el directorio de testing
if (!fs.existsSync(HEAVY_TESTING_PATH)) {
    fs.mkdirSync(HEAVY_TESTING_PATH, { recursive: true });
}

/**
 * Crea una versión "pesada" duplicando el archivo original múltiples veces
 */
function createHeavyTexture(originalPath, heavyPath, multiplier = 5) {
    try {
        const originalBuffer = fs.readFileSync(originalPath);
        const originalSize = originalBuffer.length;
        
        // Crear un buffer más grande concatenando el original múltiples veces
        const heavyBuffer = Buffer.concat(Array(multiplier).fill(originalBuffer));
        
        fs.writeFileSync(heavyPath, heavyBuffer);
        
        const newSize = heavyBuffer.length;
        console.log(`✅ Creado: ${path.basename(heavyPath)}`);
        console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Pesado:   ${(newSize / 1024 / 1024).toFixed(2)} MB (${multiplier}x)`);
        console.log(`   Incremento: +${((newSize - originalSize) / 1024 / 1024).toFixed(2)} MB`);
        
        return true;
    } catch (error) {
        console.error(`❌ Error creando ${heavyPath}:`, error.message);
        return false;
    }
}

/**
 * Crea un atlas modificado para las texturas pesadas
 */
function createHeavyAtlas(originalAtlasPath, heavyAtlasPath) {
    try {
        const originalAtlas = JSON.parse(fs.readFileSync(originalAtlasPath, 'utf8'));
        
        // Modificar las referencias de imagen para usar las versiones pesadas
        const heavyAtlas = { ...originalAtlas };
        heavyAtlas.textures = heavyAtlas.textures.map((texture, index) => ({
            ...texture,
            image: `spritesheet-${index}.webp`
        }));
        
        // Agregar metadatos sobre la versión pesada
        heavyAtlas.meta = {
            ...heavyAtlas.meta,
            version: 'heavy-testing',
            description: 'Versión pesada para testing de rendimiento',
            generated: new Date().toISOString()
        };
        
        fs.writeFileSync(heavyAtlasPath, JSON.stringify(heavyAtlas, null, 2));
        console.log(`✅ Atlas pesado creado: ${path.basename(heavyAtlasPath)}`);
        
        return true;
    } catch (error) {
        console.error(`❌ Error creando atlas pesado:`, error.message);
        return false;
    }
}

// Procesar texturas
const textures = ['spritesheet-0.webp', 'spritesheet-1.webp'];
let success = true;

textures.forEach(texture => {
    const originalPath = path.join(ZOMBIE_ANIMATIONS_PATH, texture);
    const heavyPath = path.join(HEAVY_TESTING_PATH, texture.replace('.webp', '-heavy.webp'));
    
    if (fs.existsSync(originalPath)) {
        success = createHeavyTexture(originalPath, heavyPath, 50) && success; // 50x más pesado (~100MB)
    } else {
        console.warn(`⚠️  Textura no encontrada: ${originalPath}`);
        success = false;
    }
});

// Crear atlas pesado
const originalAtlasPath = path.join(ZOMBIE_ANIMATIONS_PATH, 'atlas.json');
const heavyAtlasPath = path.join(HEAVY_TESTING_PATH, 'atlas.json');

if (fs.existsSync(originalAtlasPath)) {
    success = createHeavyAtlas(originalAtlasPath, heavyAtlasPath) && success;
} else {
    console.warn(`⚠️  Atlas no encontrado: ${originalAtlasPath}`);
    success = false;
}

// Crear archivo README explicativo
const readmePath = path.join(HEAVY_TESTING_PATH, 'README.md');
const readmeContent = `# Texturas Pesadas del Zombie - Testing de Rendimiento

Este directorio contiene versiones artificialmente pesadas de las texturas del zombie para testing de rendimiento.

## Archivos generados:

- \`spritesheet-0-heavy.webp\` - Versión 50x más pesada de spritesheet-0.webp
- \`spritesheet-1-heavy.webp\` - Versión 50x más pesada de spritesheet-1.webp  
- \`atlas.json\` - Atlas modificado que referencia las texturas pesadas

## Uso:

Para probar el rendimiento con estas texturas pesadas, utiliza \`AvatarZombieLoadHeavy\` en lugar de \`AvatarZombieLoad\`.

## Generado:

${new Date().toLocaleString()}

## Tamaños aproximados:

- Original: ~2 MB total
- Pesado: ~100 MB total (50x)
`;

fs.writeFileSync(readmePath, readmeContent);

if (success) {
    console.log('\n🎉 Texturas pesadas del zombie generadas exitosamente!');
    console.log(`📁 Ubicación: ${HEAVY_TESTING_PATH}`);
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Usar AvatarZombieLoadHeavy para cargar estas texturas');
    console.log('   2. Activar modo de testing en la configuración');
    console.log('   3. Medir tiempos de carga y uso de memoria');
} else {
    console.log('\n❌ Hubo errores generando las texturas pesadas');
    process.exit(1);
}