const fs = require('fs');

// 1. Leemos el JSON de entrada
const inputData = JSON.parse(fs.readFileSync('atlas.json', 'utf8'));

// 2. El JSON puede tener múltiples objetos en "textures"
//    Por eso iteramos sobre todos ellos
const texturesArray = inputData.textures || [];

// 3. Creamos un objeto para almacenar la información agrupada por categoría
//    Estructura: {
//      "<categoria>": {
//        files: new Set(),
//        maxWidth: 0,
//        maxHeight: 0,
//        prefix: "sprites/<categoria>/"
//      },
//      ...
//    }
const animations = {};

// 4. Recorremos cada objeto dentro de "textures"
texturesArray.forEach(texture => {
  // "texture.frames" contiene la lista de frames de esa hoja
  const frames = texture.frames || [];

  // Para cada frame, extraemos la categoría y actualizamos las estadísticas
  frames.forEach(frameData => {
    const filename = frameData.filename; // Ej: "sprites/up_walk/5"

    // Separamos por "/" para extraer la categoría
    const parts = filename.split('/');
    // parts[0] = "sprites"
    // parts[1] = "up_walk"
    // parts[2] = "5" (número), pero no lo usaremos para start/end

    const category = parts[1];

    // Tomamos el ancho/alto (puedes usar frame, sourceSize, etc., según necesites)
    const { w, h } = frameData.frame;

    // Si no existe la categoría, la creamos
    if (!animations[category]) {
      animations[category] = {
        files: new Set(),
        maxWidth: 0,
        maxHeight: 0,
        prefix: `sprites/${category}/`
      };
    }

    // Añadimos este filename al set (para contar sin duplicados)
    animations[category].files.add(filename);

    // Actualizamos el ancho y alto máximos
    if (w > animations[category].maxWidth) {
      animations[category].maxWidth = w;
    }
    if (h > animations[category].maxHeight) {
      animations[category].maxHeight = h;
    }
  });
});

// 5. Ahora construimos el objeto final de salida
const output = {};

Object.keys(animations).forEach(category => {
  const data = animations[category];

  // totalFrames: cantidad de ficheros en esa categoría
  const totalFrames = data.files.size;

  // start = 1
  // end = totalFrames
  const start = 1;
  const end = totalFrames;

  // Si la categoría incluye "walk", repeat = -1; si no, 0
  const repeat = category.includes('walk') ? -1 : 0;

  // Animación base
  const baseAnim = {
    atlasKey: "werewolf_atlas",
    prefix: data.prefix,
    flip_horizontally: false,
    start: start,
    end: end,
    frameRate: 19,
    frameWidth: data.maxWidth,
    frameHeight: data.maxHeight,
    originX: 0.5,
    originY: 0.5,
    offsetX: 0,
    offsetY: 0,
    repeat: repeat
  };

  // Registramos en el output con el nombre de la categoría
  output[category] = baseAnim;

  // 6. Si la categoría contiene la palabra "left", creamos una versión espejada
  if (category.includes('left')) {
    const mirroredCategory = category.replace('left', 'right');
    // Duplicamos la animación con flip_horizontally=true
    output[mirroredCategory] = {
      ...baseAnim,
      flip_horizontally: true
    };
  }
});

// 7. Guardamos (o mostramos) el resultado final
fs.writeFileSync('config.json', JSON.stringify(output, null, 2), 'utf8');
console.log('Generado "output.json" con todas las categorías de las múltiples texturas.');
