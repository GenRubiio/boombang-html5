const { getLayeredManifest } = require('../data/layeredCharacterManifests');
const { getPresetByIndex, getPresetByName } = require('../enums/GlovePresetsEnum');
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
 * PAL9: the first time the glove slot is resolved with no saved value, seed it from the
 * user's CURRENT progression tier (uppercutSelected) — not the raw manifest default — then
 * persist. Once an explicit choice exists, it is never recomputed from tier again.
 *
 * @param {{avatarId:number, savedSlots:Record<string,string>, uppercutSelected:number}} params
 * @returns {{slots:Record<string,string>, seeded:boolean}}
 */
function resolveGlovePalette({ avatarId, savedSlots, uppercutSelected }) {
    const manifest = getLayeredManifest(avatarId);
    const slots = { ...savedSlots };
    if (!manifest || !manifest.gloveSlot) {
        return { slots, seeded: false };
    }
    if (slots[manifest.gloveSlot] !== undefined) {
        return { slots, seeded: false };
    }
    const preset = getPresetByIndex(uppercutSelected) || getPresetByIndex(0);
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
     * Resolves the effective palette for (user, avatarId): saved slots, glove-seeded if
     * needed (PAL9, persisting the seed on first resolution).
     */
    static async resolveForUser(user, avatarId) {
        const savedSlots = user.avatarPalettes[avatarId] || {};
        const { slots, seeded } = resolveGlovePalette({
            avatarId,
            savedSlots,
            uppercutSelected: user.uppercutSelected,
        });
        user.avatarPalettes[avatarId] = slots;
        if (seeded) {
            try {
                await UserApiService.changePalette(user, avatarId, slots);
            } catch (error) {
                // Seeding is best-effort persistence; the in-memory value is already correct
                // for this session even if the write fails.
            }
        }
        return slots;
    }
}

module.exports = UserPaletteService;
module.exports.validateSlotUpdate = validateSlotUpdate;
module.exports.resolveGlovePalette = resolveGlovePalette;
module.exports.isValidHexColor = isValidHexColor;
