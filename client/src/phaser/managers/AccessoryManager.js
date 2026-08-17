/**
 * Loader/catalog for compiled accessory packages (aura/hat/pet), mirroring AvatarManager's
 * layered-loading pattern (design.md §4/§5): dynamic import() per package so an accessory
 * never enters the main chunk unless a user actually equips one, and the same
 * "patch texture.image to the fingerprinted URL, then scene.load.multiatlas" trick
 * AvatarRastaLoad.js already uses for the baked renderer.
 *
 * Not explicitly named in tasks.md's Slice 8 file list (which only calls out
 * AccessoryLayer.js) — added because AddUserController.js needs somewhere to keep loader
 * bookkeeping out of the controller itself, exactly as AvatarManager already does for the
 * layered body.
 */
const ACCESSORY_PACKAGES = {
    aura: {
        auraElectrica: {
            manifest: () => import('@/assets/game/accessories/aura/auraElectrica/auraElectrica.accessory.json'),
            atlas: () => import('@/assets/game/accessories/aura/auraElectrica/auraElectrica.aura.atlas.json'),
            webp: () => import('@/assets/game/accessories/aura/auraElectrica/auraElectrica.aura.webp'),
        },
    },
    hat: {
        hat_minnie: {
            manifest: () => import('@/assets/game/accessories/hat/hat_minnie/hat_minnie.accessory.json'),
            atlas: () => import('@/assets/game/accessories/hat/hat_minnie/hat_minnie.hat.atlas.json'),
            webp: () => import('@/assets/game/accessories/hat/hat_minnie/hat_minnie.hat.webp'),
        },
    },
    pet: {
        pet09: {
            manifest: () => import('@/assets/game/accessories/pet/pet09/pet09.accessory.json'),
            atlas: () => import('@/assets/game/accessories/pet/pet09/pet09.pet.atlas.json'),
            webp: () => import('@/assets/game/accessories/pet/pet09/pet09.pet.webp'),
        },
    },
};

class AccessoryManager {
    constructor() {
        this.manifests = new Map();
        this.inFlight = new Set();
    }

    hasPackage(kind, key) {
        return !!(ACCESSORY_PACKAGES[kind] && ACCESSORY_PACKAGES[kind][key]);
    }

    getAtlasKey(kind, key) {
        return `acc_${kind}_${key}_atlas`;
    }

    getManifest(kind, key) {
        return this.manifests.get(`${kind}:${key}`) || null;
    }

    async load(scene, kind, key) {
        const atlasKey = this.getAtlasKey(kind, key);

        if (scene.textures.exists(atlasKey)) {
            return Promise.resolve();
        }
        if (this.inFlight.has(atlasKey)) {
            return new Promise((resolve) => {
                const check = () => {
                    if (scene.textures.exists(atlasKey)) resolve();
                    else setTimeout(check, 50);
                };
                check();
            });
        }

        const entry = ACCESSORY_PACKAGES[kind] && ACCESSORY_PACKAGES[kind][key];
        if (!entry) {
            return Promise.reject(new Error(`No accessory package registered for ${kind}:${key}`));
        }

        this.inFlight.add(atlasKey);

        const [manifestModule, atlasModule, webpModule] = await Promise.all([
            entry.manifest(),
            entry.atlas(),
            entry.webp(),
        ]);
        const manifest = manifestModule.default;
        const atlasJson = atlasModule.default;
        const webpUrl = webpModule.default;

        this.manifests.set(`${kind}:${key}`, manifest);
        atlasJson.textures.forEach((texture) => {
            texture.image = webpUrl;
        });

        return new Promise((resolve, reject) => {
            scene.load.once('complete', () => {
                this.inFlight.delete(atlasKey);
                resolve();
            });
            scene.load.once('loaderror', (file) => {
                this.inFlight.delete(atlasKey);
                reject(file);
            });
            scene.load.multiatlas(atlasKey, atlasJson);
            if (!scene.load.isLoading()) {
                scene.load.start();
            }
        });
    }
}

const accessoryManager = new AccessoryManager();
export default accessoryManager;
