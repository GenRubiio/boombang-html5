const { getLayeredManifest } = require('../data/layeredCharacterManifests');
const { GLOVE_PRESETS, getPresetByIndex, getPresetByName } = require('../enums/GlovePresetsEnum');
const UserApiService = require('../services-api/UserApiService');

const HEX_COLOR_PATTERN = /^#?[0-9a-fA-F]{6}$/;

function normalizeHex(value) {
    const withoutHash = String(value).replace('#', '');
    return `#${withoutHash.toLowerCase()}`;
}

function isValidHexColor(value) {
    return typeof value === 'string' && HEX_COLOR_PATTERN.test(value);
}

/**
 * PROTO1 (server authoritative): independently validates slot-key membership, glove-preset
 * unlock status, and value shape. Never trusts client-side validation or rendering state.
 *
 * @param {{avatarId:number, slotKey:string, value:string, uppercutLevel:number}} params
 * @returns {{success:boolean, code?:string, message?:string, resolvedValue?:string}}
 */
function validateSlotUpdate({ avatarId, slotKey, value, uppercutLevel }) {
    const manifest = getLayeredManifest(avatarId);
    if (!manifest || !manifest.slots.includes(slotKey)) {
        return { success: false, code: 'UNKNOWN_SLOT', message: `Unknown slot key "${slotKey}"` };
    }

    if (slotKey === manifest.gloveSlot) {
        // PAL8: the glove slot only accepts one of the ten named presets, never a free hex.
        const preset = getPresetByName(value);
        if (!preset) {
            return {
                success: false,
                code: 'INVALID_VALUE',
                message: `The glove slot only accepts a named preset, got "${value}"`,
            };
        }
        // PAL7: gated by presetIndex <= user.uppercutLevel — the historical ringsWon ladder.
        if (preset.index > uppercutLevel) {
            return {
                success: false,
                code: 'LOCKED_PRESET',
                message: `Preset "${preset.name}" is locked for this account's progression tier`,
            };
        }
        return { success: true, resolvedValue: preset.hex };
    }

    // PAL6: any other slot accepts a free, arbitrary valid colour value.
    if (!isValidHexColor(value)) {
        return { success: false, code: 'INVALID_VALUE', message: `Invalid colour value "${value}"` };
    }
    return { success: true, resolvedValue: normalizeHex(value) };
}

/**
 * FNV-1a-style string hash — pure, deterministic, no external dependency. Used only to turn a
 * stable identifier (a user id) into a stable pseudo-random index; not a cryptographic hash.
 * @param {string} str
 * @returns {number} an unsigned 32-bit integer
 */
function hashSeedKey(str) {
    let hash = 0x811c9dc5; // FNV offset basis
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193); // FNV prime
    }
    return hash >>> 0;
}

/**
 * Gameplay defect fix (2026-08-19): picks a glove-preset index in [0, maxIndex] that is
 * RANDOM across different seed keys but STABLE for the same one — so a bot (or a human who
 * never explicitly chose a glove colour) keeps the same glove colour every time it is resolved
 * in the same session, instead of re-rolling on every resolution (which would make the glove
 * change colour mid-fight, a new bug). `seedKey` should be something stable about the account,
 * e.g. the user's own id.
 *
 * @param {string|number} seedKey
 * @param {number} maxIndex the highest unlocked preset index (0-based, inclusive)
 * @returns {number}
 */
function pickStableGloveIndex(seedKey, maxIndex) {
    if (!Number.isFinite(maxIndex) || maxIndex <= 0) {
        return 0;
    }
    return hashSeedKey(String(seedKey)) % (maxIndex + 1);
}

/**
 * PAL9 (gameplay defect fix, 2026-08-19): the first time the glove slot is resolved with no
 * saved value, seed it with a preset picked RANDOMLY among every preset unlocked at the user's
 * CURRENT progression tier (uppercutLevel) — not merely that tier's own single index, and not
 * the raw manifest default — then persist. The pick is stable per user id (pickStableGloveIndex)
 * so it never changes across resolutions for the same account. Once an explicit choice exists
 * (a real saved value), it is never recomputed from tier again.
 *
 * @param {{avatarId:number, savedSlots:Record<string,string>, uppercutLevel:number, userId:string|number}} params
 * @returns {{slots:Record<string,string>, seeded:boolean}}
 */
function resolveGlovePalette({ avatarId, savedSlots, uppercutLevel, userId }) {
    const manifest = getLayeredManifest(avatarId);
    const slots = { ...savedSlots };
    if (!manifest || !manifest.gloveSlot) {
        return { slots, seeded: false };
    }
    if (slots[manifest.gloveSlot] !== undefined) {
        return { slots, seeded: false };
    }
    const maxIndex = Math.max(0, Math.min(uppercutLevel ?? 0, GLOVE_PRESETS.length - 1));
    const index = pickStableGloveIndex(userId, maxIndex);
    const preset = getPresetByIndex(index) || getPresetByIndex(0);
    slots[manifest.gloveSlot] = preset.hex;
    return { slots, seeded: true };
}

/**
 * Thin orchestrator: validate -> persist (server -> API -> DB, design.md §6) -> update the
 * in-memory palette map. Never disconnects on rejection (PROTO2) — callers (the socket
 * controller) always emit a functional ACK regardless of the returned `success` value.
 */
class UserPaletteService {
    static async changeSlot(user, avatarId, slotKey, value) {
        const result = validateSlotUpdate({
            avatarId,
            slotKey,
            value,
            uppercutLevel: user.uppercutLevel,
        });
        if (!result.success) {
            return result;
        }

        if (!user.avatarPalettes[avatarId]) {
            user.avatarPalettes[avatarId] = {};
        }
        user.avatarPalettes[avatarId][slotKey] = result.resolvedValue;

        try {
            await UserApiService.changePalette(user, avatarId, user.avatarPalettes[avatarId]);
        } catch (error) {
            return { success: false, code: 'RATE_LIMITED', message: 'Could not persist palette change' };
        }

        return { success: true, resolvedValue: result.resolvedValue };
    }

    /**
     * Gameplay defect fix (2026-08-19): the real production wiring point for PAL9. Called
     * synchronously from `UserResource.transform()` — the single choke point every user (bot
     * or human) is serialized through, on login, scene join, sync and every user-change-*
     * broadcast (server/src/resources/UserResource.js) — so it mutates `user.avatarPalettes`
     * IN-MEMORY before the very first payload naming this (user, avatarId) pair is ever sent,
     * meaning the client never has a chance to fall through to the manifest's raw default hex.
     * Persistence to the API is deliberately fire-and-forget best-effort here (never awaited by
     * the synchronous resource transform) — the in-memory value is already correct for this
     * session even if the write fails or has not completed by the time this payload goes out.
     */
    static seedPaletteForResource(user, avatarId) {
        if (avatarId === undefined || avatarId === null || !user || !user.avatarPalettes) {
            return;
        }
        const savedSlots = user.avatarPalettes[avatarId] || {};
        const { slots, seeded } = resolveGlovePalette({
            avatarId,
            savedSlots,
            uppercutLevel: user.uppercutLevel,
            userId: user.id,
        });
        user.avatarPalettes[avatarId] = slots;
        if (seeded) {
            UserApiService.changePalette(user, avatarId, slots).catch(() => {
                // Seeding is best-effort persistence; the in-memory value (already assigned
                // above) is correct for this session even if the write fails.
            });
        }
    }
}

module.exports = UserPaletteService;
module.exports.validateSlotUpdate = validateSlotUpdate;
module.exports.resolveGlovePalette = resolveGlovePalette;
module.exports.pickStableGloveIndex = pickStableGloveIndex;
module.exports.isValidHexColor = isValidHexColor;
