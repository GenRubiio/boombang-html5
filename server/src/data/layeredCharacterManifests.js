const AvatarEnum = require('../enums/AvatarEnum');

// Server-side mirror of the compiled layered manifest's slot-set shape (client/src/assets/
// game/avatars/<character>/layers/<character>.layers.manifest.json — design.md §3.1 step 5,
// §6 UserPaletteService validation). The server never reads the client's compiled JSON
// directly — the server container only mounts server/ (docker-compose.yml), never client/, so
// this is a real deployment-topology constraint, not merely an ESM/CJS nuance — so this small,
// independently maintained table mirrors its `slots`/`gloveSlot` shape by hand. Add one entry
// per additional layered character, keeping `slots` in sync with that character's manifest.json.
//
// Gameplay defect fix (2026-08-19): this table held ONLY `rasta` (Slice 1 of the archived
// avatar-color-accessory-system) even though the avatar-system-multichar-fixes roster
// migration (slices 20-32, tasks.md) has since compiled 15 more layered characters. Every one
// of them was silently treated as having NO layered manifest at all by
// `UserPaletteService.validateSlotUpdate`/`resolveGlovePalette` — the dominant reason 5 of the
// 6 currently-running bots (whose avatarId is BOOMER/GATA/BRUJITA, not RASTA) never got their
// glove seeded at all and kept rendering the client manifest's raw default hex (see
// apply-progress.md's root-cause account). `ghost`/`wraith` are deliberately NOT listed here —
// tasks.md's slice 23 leaves their `--from-vector` base-pack question unresolved and neither
// has a compiled `.layers.manifest.json` on disk (verified 2026-08-19); `god` is a new
// character under separate, concurrent development and is out of this fix's scope. Every
// `slots` array below is copied verbatim from that character's real compiled `slots` field
// (verified via a direct read of the compiled JSON, 2026-08-19) — never hand-guessed.
const LAYERED_CHARACTER_MANIFESTS = {
    [AvatarEnum.BOOMER]: {
        character: 'boomer',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7', 'color8', 'color9', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.BRUJITA]: {
        character: 'brujita',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color8', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.CHOLO]: {
        character: 'cholo',
        slots: ['color1', 'color2', 'color3', 'color4', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.EMPOLLON]: {
        character: 'empollon',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.GATA]: {
        character: 'gata',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.INDIA]: {
        character: 'india',
        slots: ['color1', 'color2', 'color4', 'color5', 'color6', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.LILIAN]: {
        character: 'lilian',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.MARSU]: {
        character: 'marsu',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.MODERN]: {
        character: 'modern',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.NINJA]: {
        character: 'ninja',
        slots: ['color1', 'color2', 'color3', 'color4', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.RASTA]: {
        character: 'rasta',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color7', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    // Her colormeta.defaults is genuinely empty (apply-progress.md's Slice 22 record) — the
    // ONLY real slot she has comes from a base-piece-tagged colour with no declared default
    // (computeManifestSlots' piece-referenced half), which happens to be colorGuante.
    [AvatarEnum.SALLY]: {
        character: 'sally',
        slots: ['colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.SKELETON]: {
        character: 'skeleton',
        slots: ['color1', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.WEREWOLF]: {
        character: 'werewolf',
        slots: ['color1', 'color2', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.YAYO]: {
        character: 'yayo',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color7', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
    [AvatarEnum.ZOMBIE]: {
        character: 'zombie',
        slots: ['color1', 'color2', 'color3', 'colorGuante'],
        gloveSlot: 'colorGuante',
    },
};

function getLayeredManifest(avatarId) {
    return LAYERED_CHARACTER_MANIFESTS[avatarId] || null;
}

function isLayeredCharacter(avatarId) {
    return !!LAYERED_CHARACTER_MANIFESTS[avatarId];
}

module.exports = { LAYERED_CHARACTER_MANIFESTS, getLayeredManifest, isLayeredCharacter };
