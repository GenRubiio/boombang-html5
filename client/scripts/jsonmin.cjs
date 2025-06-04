const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/assets/game');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, callback);
        } else if (path.extname(fullPath) === '.json') {
            callback(fullPath);
        }
    });
}

walk(targetDir, (filePath) => {
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(raw);
        const minified = JSON.stringify(json); // sin espacios
        fs.writeFileSync(filePath, minified, 'utf-8');
        console.log(`✔️ Minificado: ${filePath}`);
    } catch (err) {
        console.error(`❌ Error al minificar ${filePath}:`, err.message);
    }
});
