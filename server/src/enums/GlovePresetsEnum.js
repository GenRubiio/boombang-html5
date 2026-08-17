// Maps UppercutsEnum index -> {name, hex} for the glove/colorGuante palette slot (design.md
// §5, avatar-palette PAL7/PAL8). Hex values are copied from TintManager.COLOR_HEX
// (client/src/phaser/managers/TintManager.js:9-14) so the layered palette system and the
// baked global-tint uppercut mechanism agree on colour identity by construction. Names match
// the "rings" translation keys under client/src/assets/lang/*/translations.json — read by
// key there, never duplicated as display strings here.
const GLOVE_PRESETS = [
    { name: 'red', hex: '#ee4724', index: 0 },
    { name: 'pink', hex: '#e93dc7', index: 1 },
    { name: 'orange', hex: '#f09b20', index: 2 },
    { name: 'green', hex: '#46f020', index: 3 },
    { name: 'blue', hex: '#2056f0', index: 4 },
    { name: 'white', hex: '#f5f5f7', index: 5 },
    { name: 'purple', hex: '#8c19c6', index: 6 },
    { name: 'brown', hex: '#a96a0a', index: 7 },
    { name: 'black', hex: '#464643', index: 8 },
    { name: 'gold', hex: '#fdd419', index: 9 },
];

function getPresetByIndex(index) {
    return GLOVE_PRESETS.find((preset) => preset.index === index);
}

function getPresetByName(name) {
    if (typeof name !== 'string') return undefined;
    const lower = name.toLowerCase();
    return GLOVE_PRESETS.find((preset) => preset.name === lower);
}

function isValidPresetName(name) {
    return !!getPresetByName(name);
}

module.exports = { GLOVE_PRESETS, getPresetByIndex, getPresetByName, isValidPresetName };
