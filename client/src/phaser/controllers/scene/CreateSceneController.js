import AddUserController from "./AddUserController.js";
import socket from "../../../sockets/socket.js"; // Conexión Socket.io
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum.js";
import FloorPulseAnimation from "../../animations/FloorPulseAnimation.js";
import SetUserCardController from "../scene/SetUserCardController.js";
import EventLimiter from "../../../utils/EventLimiter.js";
import CatalogItemTypeOfBehaviorEnum from "../../../enums/CatalogItemTypeOfBehaviorEnum.js";
import gameConfig from "@/config/gameConfig.js";

class CreateSceneController {
  //TODO: El bob y blitter esta consumiendo 5% de CPU hay que condicionarlo para que no aparezca si no es necesario. Ya lo he comprobado y solo hay que quitarlo
  static async main(gameScene, data) {
    const usersData = data.players;
    const sceneryData = data.scenery;
    const authUserData = data.authUser;

    // El sceneScaleFactor ya fue inicializado en PublicScene.create()

    // Inicializar sistema de oscurecimiento dinámico ANTES de cargar assets
    // para que el background pueda registrarse correctamente
    if (sceneryData.darkening && sceneryData.game_time) {
      if (!gameScene.darkeningData) {
        //console.log('🌙 Inicializando sistema de oscurecimiento:', sceneryData.game_time);
        this.#initializeDarkening(gameScene, sceneryData.game_time);
        //console.log('🌙 darkeningData inicializado:', gameScene.darkeningData);
      }
      // El oscurecimiento ahora se aplica globalmente en el método update() de la escena
    }

    if (import.meta.env.VITE_ANIMATION_AVATAR_EDITOR == "false") {
      this.createTile(
        gameScene,
        sceneryData.game_map,
        sceneryData.map_rows,
        sceneryData.map_cols
      );
    }

    this.#createArrows(gameScene);
    this.#playSceneSound(gameScene, sceneryData);
    await this.createUsers(gameScene, usersData, authUserData);
  }

  static createTile(gameScene, map, rows, cols) {
    // Aplicar factor de escala para big_scene (0.5 si es big_scene, 1 si no)
    const scaleFactor = gameScene.sceneScaleFactor || 1;

    // Dimensiones base sin escalar (el blitter se encargará de escalar)
    const tileWidth = 65 * scaleFactor  * gameConfig.DPI;
    const tileHeight = 33 * scaleFactor * gameConfig.DPI;
    const halfTileWidth = tileWidth / gameConfig.DPI;
    const halfTileHeight = tileHeight / gameConfig.DPI;

    const W = gameScene.scale.width;
    const H = gameScene.scale.height;
    const centerX = W / gameConfig.DPI;

    const blitter = gameScene.add.blitter(0, 0, scaleFactor == 1 ? "tile" : "tile_small");
    blitter.setDepth(100);

    // Si quieres seguir guardando referencias solo para los tiles visibles:
    gameScene.tiles = Array.from({ length: rows }, () =>
      Array(cols).fill(null)
    );

    // --------- Cálculo de límites de visibilidad ----------
    // s = row + col controla la "diagonal" (afecta a Y)
    // y = s * halfTileHeight debe caer dentro de pantalla (con pequeño margen)
    const marginY = halfTileHeight; // margen para bordes
    const sMaxByHeight = Math.floor((H + marginY) / halfTileHeight);
    const sMax = Math.min(sMaxByHeight, rows - 1 + (cols - 1)); // tope real del mapa

    // Para X: x = (col - row) * halfTileWidth + centerX debe entrar en [-margenX, W + margenX]
    const marginX = halfTileWidth;
    const diffMin = Math.ceil((-marginX - centerX) / halfTileWidth); // (col - row) mínimo
    const diffMax = Math.floor((W + marginX - centerX) / halfTileWidth); // (col - row) máximo

    // Recorremos por diagonales s = row + col, solo hasta sMax (parte superior del rombo)
    for (let s = 0; s <= sMax; s++) {
      // col está en [max(0, s-(rows-1)), min(cols-1, s)] para mantener row y col dentro de la matriz
      const colStart = Math.max(0, s - (rows - 1));
      const colEnd = Math.min(cols - 1, s);

      for (let col = colStart; col <= colEnd; col++) {
        const row = s - col;

        // Filtro por X: (col - row) debe caer en [diffMin, diffMax]
        const diff = col - row;
        if (diff < diffMin || diff > diffMax) continue;

        // Coordenadas proyectadas
        const x = (col - row) * halfTileWidth + centerX;
        const y = (col + row) * halfTileHeight;

        // Doble verificación por seguridad (clipping de pantalla)
        if (x < -marginX || x > W + marginX) continue;
        if (y < -marginY || y > H + marginY) continue;

        // Crear bob solo si se quiere mostrar algo sobre el tile
        const isClickable = map[row][col] === 0;
        const bob = blitter.create(x - halfTileWidth, y - halfTileHeight);

        if (
          import.meta.env.VITE_MAP_MAKER == "true" ||
          import.meta.env.VITE_SHOW_ISOMAP == "true" ||
          gameScene.sceneData.authUser?.admin_tools?.show_isomap
        ) {
          if (!isClickable) bob.tint = 0x808080;
          bob.alpha = 0.5;
        } else {
          bob.alpha = 0;
        }

        // Guarda referencia SOLO para los visibles
        gameScene.tiles[row][col] = {
          bob,
          gridPos: { x: col, y: row },
          isClickable,
        };
      }
    }

    // Rombo local para test de click fino
    // halfTileWidth y halfTileHeight ya incluyen scaleFactor
    const diamondPolygon = new Phaser.Geom.Polygon([
      { x: -halfTileWidth, y: 0 },
      { x: 0, y: -halfTileHeight },
      { x: halfTileWidth, y: 0 },
      { x: 0, y: halfTileHeight },
    ]);

    const zone = gameScene.add.zone(0, 0, W, H).setOrigin(0).setInteractive();
    if (import.meta.env.VITE_MAP_MAKER == "true") {
      // Desactivar el menú contextual del navegador para permitir usar el botón derecho
      if (
        gameScene.input &&
        gameScene.input.mouse &&
        gameScene.input.mouse.disableContextMenu
      ) {
        gameScene.input.mouse.disableContextMenu();
      }
    }

    zone.on("pointerdown", (pointer) => {
      if (!EventLimiter.canClick()) return;

      // Check if click is on a notification button (high depth objects)
      const hitObjects = gameScene.input.hitTestPointer(pointer);
      for (let obj of hitObjects) {
        if (
          obj.input &&
          obj.input.enabled &&
          obj !== zone &&
          obj.depth >= 1000
        ) {
          // Click is on a notification button or similar UI element, ignore floor click
          return;
        }
      }

      const mx = pointer.worldX;
      const my = pointer.worldY;

      // Inversión iso (usando dimensiones ajustadas por scaleFactor)
      const colFloat =
        ((mx - centerX) / halfTileWidth + my / halfTileHeight) / gameConfig.DPI;
      const rowFloat =
        (my / halfTileHeight - (mx - centerX) / halfTileWidth) / gameConfig.DPI;

      const col = Math.round(colFloat);
      const row = Math.round(rowFloat);

      if (col < 0 || col >= cols || row < 0 || row >= rows) return;

      // Centro del tile (usando dimensiones ajustadas)
      const tileCenterX = (col - row) * halfTileWidth + centerX;
      const tileCenterY = (col + row) * halfTileHeight;
      const localX = mx - tileCenterX;
      const localY = my - tileCenterY;

      if (!Phaser.Geom.Polygon.Contains(diamondPolygon, localX, localY)) return;

      // Edición de tiles en modo editor: botón derecho despinta (1), izquierdo pinta (0)
      if (import.meta.env.VITE_MAP_MAKER == "true") {
        // Despintar con botón derecho -> no transitable (1)
        if (pointer.rightButtonDown && pointer.rightButtonDown()) {
          if (map[row][col] !== 1) {
            map[row][col] = 1;
            const t = gameScene.tiles[row][col];
            if (t?.bob) {
              t.isClickable = false;
              t.bob.tint = 0x808080;
              t.bob.alpha = 0.5;
            }
            if (import.meta.env.VITE_APP_ENV === "local") console.log(map);
          }
          return; // no continuar con movimiento (click derecho nunca mueve)
        }
        // Pintar con botón izquierdo -> transitable (0)
        if (pointer.leftButtonDown && pointer.leftButtonDown()) {
          if (map[row][col] !== 0) {
            map[row][col] = 0;
            const t = gameScene.tiles[row][col];
            if (t?.bob) {
              t.isClickable = true;
              t.bob.clearTint?.();
              t.bob.alpha = 1;
            }
            if (import.meta.env.VITE_APP_ENV === "local") console.log(map);
            return; // consumimos el click porque hemos editado el tile
          }
          // Si ya era 0, permitimos que continúe la lógica de movimiento
        }
      }

      // Determina clickeable desde el mapa (no dependas de gameScene.tiles)
      const isClickable = map[row][col] === 0;

      // Verificar también si el tile está ocupado por objetos (si existe tileGrid)
      // But allow movement through WALKABLE items
      let isTileOccupied = false;
      if (
        gameScene.tileGrid &&
        gameScene.tileGrid[row] &&
        gameScene.tileGrid[row][col] &&
        gameScene.tileGrid[row][col].occupied
      ) {
        const occupyingObjectId = gameScene.tileGrid[row][col].objectId;
        const occupyingObject = gameScene.sceneItems?.find(
          (item) => item.id === occupyingObjectId
        );

        // Only consider it occupied if it's not a WALKABLE/WALKABLE_OVERLAY item
        if (
          !occupyingObject ||
          (occupyingObject.type_of_behavior !==
            CatalogItemTypeOfBehaviorEnum.WALKABLE &&
            occupyingObject.type_of_behavior !==
            CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY)
        ) {
          isTileOccupied = true;
        }
      }

      if (!isClickable || isTileOccupied) {
        if (import.meta.env.VITE_APP_ENV === "local") {
          console.log(
            `Tile at ${col}, ${row} is not clickable. Reason: ${!isClickable ? "floor not walkable" : "occupied by object"
            }`
          );
        }

        // Emitir CHANGE_LOOK tanto para tiles no clickeables como para tiles ocupados por objetos
        socket.emit(RequestSocketsEnum.CHANGE_LOOK, { x: col, y: row });

        // Solo actualizar el mapa si es por razones de piso no transitable y está en modo editor
        if (!isClickable && import.meta.env.VITE_MAP_MAKER === "true") {
          // Actualiza el mapa (aunque no exista bob)
          map[row][col] = 0;

          // Si existe un bob visible, actualiza aspecto
          const t = gameScene.tiles[row][col];
          if (t?.bob) {
            t.isClickable = true;
            t.bob.clearTint?.();
            t.bob.alpha = 1;
          }
          if (import.meta.env.VITE_APP_ENV === "local") console.log(map);
        }

        return; // Bloquear completamente cualquier acción adicional
      }

      // Check if move mode is active (editing objects) to prevent character movement
      if (gameScene.moveModeActive) {
        if (import.meta.env.VITE_APP_ENV === "local") {
          console.log(`Move mode active - blocking character movement to tile at ${col}, ${row}`);
        }
        return; // Block character movement when in edit mode
      }

      if (import.meta.env.VITE_APP_ENV === "local") {
        console.log(`Clicked tile at ${col}, ${row}`);
      }
      socket.emit(RequestSocketsEnum.USER_MOVE, { x: col, y: row });
      FloorPulseAnimation.main(gameScene, mx, my);
    });
    if (import.meta.env.VITE_MAP_MAKER == "true") {
      // Soporte de arrastre para pintar/despintar manteniendo el botón
      zone.on("pointermove", (pointer) => {
        if (import.meta.env.VITE_MAP_MAKER !== "true") return;
        if (!pointer.isDown) return;

        // Evitar pintar sobre UI superpuesta
        const hitObjects = gameScene.input.hitTestPointer(pointer);
        for (let obj of hitObjects) {
          if (
            obj.input &&
            obj.input.enabled &&
            obj !== zone &&
            obj.depth >= 1000
          ) {
            return;
          }
        }

        const mx = pointer.worldX;
        const my = pointer.worldY;

        const colFloat =
          ((mx - centerX) / halfTileWidth + my / halfTileHeight) / gameConfig.DPI;
        const rowFloat =
          (my / halfTileHeight - (mx - centerX) / halfTileWidth) / gameConfig.DPI;

        const col = Math.round(colFloat);
        const row = Math.round(rowFloat);

        if (col < 0 || col >= cols || row < 0 || row >= rows) return;

        const tileCenterX = (col - row) * halfTileWidth + centerX;
        const tileCenterY = (col + row) * halfTileHeight;
        const localX = mx - tileCenterX;
        const localY = my - tileCenterY;

        if (!Phaser.Geom.Polygon.Contains(diamondPolygon, localX, localY))
          return;

        // Arrastre: botón izquierdo pinta (0), botón derecho despinta (1)
        if (pointer.leftButtonDown && pointer.leftButtonDown()) {
          if (map[row][col] !== 0) {
            map[row][col] = 0;
            const t = gameScene.tiles[row][col];
            if (t?.bob) {
              t.isClickable = true;
              t.bob.clearTint?.();
              t.bob.alpha = 1;
            }
            if (import.meta.env.VITE_APP_ENV === "local") console.log(map);
          }
        } else if (pointer.rightButtonDown && pointer.rightButtonDown()) {
          if (map[row][col] !== 1) {
            map[row][col] = 1;
            const t = gameScene.tiles[row][col];
            if (t?.bob) {
              t.isClickable = false;
              t.bob.tint = 0x808080;
              t.bob.alpha = 0.5;
            }
            if (import.meta.env.VITE_APP_ENV === "local") console.log(map);
          }
        }
      });
    }
  }

  static #createArrows(gameScene) {
    // Place arrows in the scene using the loaded textures and position data
    if (!gameScene.sceneData.scenery.arrows) {
      return; // No arrows to place
    }

    // Use the same tile dimensions as in createTile method
    // Aplicar factor de escala para big_scene
    const scaleFactor = gameScene.sceneScaleFactor || 1;
    const tileWidth = 65 * gameConfig.DPI * scaleFactor;
    const tileHeight = 33 * gameConfig.DPI * scaleFactor;
    const halfTileWidth = (tileWidth / gameConfig.DPI);
    const halfTileHeight = (tileHeight / gameConfig.DPI);

    const W = gameScene.scale.width;
    const centerX = W / gameConfig.DPI;

    for (const arrow of gameScene.sceneData.scenery.arrows) {
      // Check if sprite was loaded properly
      const spriteName = "arrow_" + arrow.sprite_name;
      if (!gameScene.textures.exists(spriteName)) {
        console.error(`Arrow sprite not found: ${spriteName}`);
        continue;
      }

      const col = parseInt(arrow.position_x) || 0; // Grid column position
      const row = parseInt(arrow.position_y) || 0; // Grid row position

      // Convert grid position to isometric screen coordinates (same logic as tiles)
      const screenX = (col - row) * halfTileWidth + centerX;
      const screenY = (col + row) * halfTileHeight;

      // Create the arrow sprite at the converted screen position
      // Adjust positioning to center on tile - use same origin as tiles and add small offset
      const arrowScale = (arrow.scale || gameConfig.DPI) * scaleFactor;
      gameScene.add
        .image(screenX, screenY + halfTileHeight, spriteName)
        .setOrigin(0.5, 1) // Center the arrow
        .setDepth(0) // Place arrows above tiles and other objects
        .setName(spriteName)
        .setScale(arrowScale); // Apply scale with big_scene factor
    }
  }

  static #playSceneSound(gameScene, sceneryData) {
    // Verificar que existan los datos de sonido
    if (!sceneryData.sound || !sceneryData.sound_url) {
      return; // No hay sonido configurado para esta escena
    }

    // Verificar si el usuario tiene el sonido silenciado
    const authUser = gameScene.sceneData.authUser;
    if (authUser && authUser.phaser_scene_sound_muted) {
      if (import.meta.env.VITE_APP_ENV === "local") {
        console.log("🔇 Sonido de la escena silenciado por configuración del usuario");
      }
      return;
    }

    const viteEnv = import.meta.env.VITE_APP_ENV;
    const soundFile = viteEnv === 'local' ? sceneryData.sound : sceneryData.sound_url;

    // Verificar que el archivo de sonido no sea null o vacío
    if (!soundFile || soundFile.trim() === '') {
      return;
    }

    // Detener cualquier sonido de escena anterior si existe
    if (gameScene.sceneBackgroundMusic) {
      gameScene.sceneBackgroundMusic.stop();
      gameScene.sceneBackgroundMusic.destroy();
      gameScene.sceneBackgroundMusic = null;
    }

    // Cargar y reproducir el sonido de fondo
    const soundKey = 'scene_bg_music_' + sceneryData.id;

    // Si el sonido no está cargado, cargarlo primero
    if (!gameScene.cache.audio.exists(soundKey)) {
      gameScene.load.audio(soundKey, soundFile);
      gameScene.load.once('complete', () => {
        this.#startBackgroundMusic(gameScene, soundKey);
      });
      gameScene.load.start();
    } else {
      // Si ya está cargado, reproducirlo directamente
      this.#startBackgroundMusic(gameScene, soundKey);
    }
  }

  static #startBackgroundMusic(gameScene, soundKey) {
    try {
      // Obtener el volumen de la configuración del usuario (0-100) y convertirlo a 0-1
      const authUser = gameScene.sceneData.authUser;
      const userVolume = authUser && authUser.phaser_scene_sound_volume !== undefined
        ? authUser.phaser_scene_sound_volume / 100
        : 0.5; // Volumen por defecto al 50%

      // Crear el sonido con configuración de bucle
      gameScene.sceneBackgroundMusic = gameScene.sound.add(soundKey, {
        loop: true,
        volume: userVolume
      });

      // Reproducir el sonido
      gameScene.sceneBackgroundMusic.play();

      if (import.meta.env.VITE_APP_ENV === "local") {
        console.log(`🎵 Reproduciendo música de fondo de la escena: ${soundKey}`);
      }
    } catch (error) {
      console.error("Error al reproducir música de fondo de la escena:", error);
    }
  }

  static async createUsers(gameScene, usersData, authUserData) {
    // Crear los jugadores iniciales de manera secuencial para evitar condiciones de carrera
    try {
      for (let i = 0; i < usersData.length; i++) {
        const userData = usersData[i];
        await AddUserController.main(gameScene, userData);
      }

      SetUserCardController.main(gameScene, authUserData, authUserData);
    } catch (error) {
      console.error("🎮 CreateSceneController: Error creando usuarios:", error);
    }
  }

  /**
   * Inicializa el sistema de oscurecimiento dinámico
   */
  static #initializeDarkening(gameScene, initialGameTime) {
    // Guardar el tiempo inicial y timestamp
    gameScene.darkeningData = {
      initialGameTime: initialGameTime,
      initialTimestamp: Date.now(),
      backgrounds: [],
      arrows: [],
      items: []
    };

    // El oscurecimiento ahora se aplica globalmente en el método update() de la escena
    // No es necesario actualizar cada sprite individualmente
  }
}

export default CreateSceneController;
