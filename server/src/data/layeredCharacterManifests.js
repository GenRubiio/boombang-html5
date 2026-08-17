const AvatarEnum = require('../enums/AvatarEnum');

// Server-side mirror of the compiled layered manifest's slot-set shape (client/src/assets/
// game/avatars/<character>/layers/<character>.layers.manifest.json — design.md §3.1 step 5,
// §6 UserPaletteService validation). The server never reads the client's compiled JSON
// directly — different module system (ESM vs this CJS server), and Vite-only build output —
// so this small, independently maintained table mirrors its `slots`/`gloveSlot` shape by
// hand. Only `rasta` is compiled today (Slice 1); add one entry per additional layered
// character, keeping `slots` in sync with that character's manifest.json.
const LAYERED_CHARACTER_MANIFESTS = {
    [AvatarEnum.RASTA]: {
        character: 'rasta',
        slots: ['color1', 'color2', 'color3', 'color4', 'color5', 'color7', 'colorGuante'],
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
