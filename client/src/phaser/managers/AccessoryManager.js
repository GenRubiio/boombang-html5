/**
 * Loader/catalog for compiled accessory packages (aura/hat/pet), mirroring AvatarManager's
 * layered-loading pattern (design.md §4/§5): dynamic import() per package so an accessory
 * never enters the main chunk unless a user actually equips one, and the same
 * "patch texture.image to the fingerprinted URL, then scene.load.multiatlas" trick
 * AvatarRastaLoad.js already uses for the baked renderer.
 *
 * Character-scoped registry (design.md §4/§7, fact F): package identity in the source data IS
 * `(char, kind, key)` — `Custom6Hat` is genuinely a different package under `rasta`, `lilian`
 * and `boomer`, each with its own anchor geometry. Keys are `${character}:${kind}:${key}`, with
 * a character-independent `'*'` tier for packages that declare no character (auras, ACC2). The
 * actual lookup-order/atlas-key/mismatch logic lives in the pure `accessoryRegistryResolve.js`
 * (unit-tested there); this class is I/O-shell glue around it (design.md §8).
 */
import {
    resolveAccessoryRegistryKey,
    resolveAccessoryAtlasKey,
    checkManifestCharMismatch,
    listAccessoryKeysForCharacter,
} from './accessoryRegistryResolve.js';
import { buildAccessoryPackagesFromGlob } from './buildAccessoryPackagesFromGlob.js';

// design.md §14 cost 14 (tasks.md slice 9): registry contents are now DISCOVERED from the
// compiled output directory layout, not hand-maintained — replacing the literal
// `ACCESSORY_PACKAGES` map (PR4) that needed one entry added by hand per package. Lazy by
// default (no `{eager: true}`), so a package still never enters the main chunk unless equipped
// — the same guarantee the hand-written per-package `() => import(...)` closures gave.
// `parseAccessoryAssetPath.js`/`buildAccessoryPackagesFromGlob.js` (both pure, unit-tested) do
// the actual grouping; this one line is the I/O-shell glob call itself.
const ACCESSORY_PACKAGES = buildAccessoryPackagesFromGlob(
    import.meta.glob('@/assets/game/accessories/**/*.{accessory.json,atlas.json,webp}')
);

class AccessoryManager {
    constructor() {
        this.manifests = new Map();
        this.inFlight = new Set();
    }

    hasPackage(character, kind, key) {
        return !!resolveAccessoryRegistryKey(ACCESSORY_PACKAGES, character, kind, key);
    }

    /**
     * avatar-system-multichar-fixes (coordinator addendum): the debug panel's dropdowns list
     * the full COMPILED catalogue for a character, not the account's owned subset — delegates
     * straight to the pure, unit-tested `listAccessoryKeysForCharacter` (this class's own
     * established I/O-shell-delegation precedent, matching `hasPackage`/`getAtlasKey` above).
     */
    listKeysForCharacter(character, kind) {
        return listAccessoryKeysForCharacter(ACCESSORY_PACKAGES, character, kind);
    }

    getAtlasKey(character, kind, key) {
        const resolvedKey = resolveAccessoryRegistryKey(ACCESSORY_PACKAGES, character, kind, key);
        if (!resolvedKey) return null;
        return resolveAccessoryAtlasKey(resolvedKey, kind, key);
    }

    getManifest(character, kind, key) {
        const resolvedKey = resolveAccessoryRegistryKey(ACCESSORY_PACKAGES, character, kind, key);
        return resolvedKey ? this.manifests.get(resolvedKey) || null : null;
    }

    async load(scene, character, kind, key) {
        const resolvedKey = resolveAccessoryRegistryKey(ACCESSORY_PACKAGES, character, kind, key);
        if (!resolvedKey) {
            // design.md §7: "miss -> the accessory is not created, and the miss is reported
            // with both requested character and key. Never a silent no-render."
            throw new Error(
                `AccessoryManager: no package registered for character="${character}" kind="${kind}" key="${key}"`
            );
        }

        const atlasKey = resolveAccessoryAtlasKey(resolvedKey, kind, key);

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

        const entry = ACCESSORY_PACKAGES[resolvedKey];
        this.inFlight.add(atlasKey);

        // Live-caught defect (tasks.md slices 28-31, apply-progress.md): `entry.webp` is an
        // ARRAY, one loader per page (`buildAccessoryPackagesFromGlob.js`'s own fix) — a
        // multi-page package (any hat needing >1 page, most measured at 2, one at 3) has that
        // many `.webp` files, and every page's own image data is distinct. The old single-`
        // webpModule` shape silently kept only ONE page's URL and patched EVERY atlas texture
        // entry to it, so any frame living on page 1+ rendered page 0's pixels cropped at page
        // N's own frame coordinates — wrong texture data, never a crash, never asserted by the
        // resolved-state matrix (R1-R13 check container order/depth/tint, never atlas pixel
        // correctness). Fixed the same way `AvatarManager.loadLayeredAvatar`'s own per-key
        // action-pack loading already does it (that code path's own precedent, unaffected by
        // this bug since bodies never shared this file): one URL per page, patched by index.
        const [manifestModule, atlasModule, ...webpModules] = await Promise.all([
            entry.manifest(),
            entry.atlas(),
            ...entry.webp.map((loadWebp) => loadWebp()),
        ]);
        const manifest = manifestModule.default;
        const atlasJson = atlasModule.default;
        const webpUrls = webpModules.map((m) => m.default);

        // design.md §7 success criterion 6: reported, not silently accepted — a package whose
        // compiled manifest.char disagrees with the requested character is a registry
        // programming error (a package staged/registered under the wrong key), not a runtime
        // condition to hide. Never blocks the load (matching AddUserController's "a failed
        // accessory load must never block avatar creation" philosophy) — reported and applied
        // as-is, since the caller already resolved this exact registry key deliberately.
        const mismatch = checkManifestCharMismatch(resolvedKey, manifest.char, character);
        if (mismatch) {
            console.warn(mismatch);
        }

        this.manifests.set(resolvedKey, manifest);
        atlasJson.textures.forEach((texture, i) => {
            texture.image = webpUrls[i];
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
