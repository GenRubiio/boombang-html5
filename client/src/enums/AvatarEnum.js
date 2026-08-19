import Enum from './Enum';

const AvatarEnum = new Enum({
    BOOMER: 1,
    BRUJITA: 2,
    CHOLO: 3,
    EMPOLLON: 4,
    GATA: 5,
    GHOST: 6,
    INDIA: 7,
    LILIAN: 8,
    MARSU: 9,
    MODERN: 10,
    NINJA: 11,
    RASTA: 12,
    SKELETON: 13,
    WEREWOLF: 14,
    WRAITH: 15,
    YAYO: 16,
    ZOMBIE: 17,
    // avatar-system-multichar-fixes slice 10 (design.md §15): sally becomes a playable client
    // character (new id). Parallel by convention to server/src/enums/AvatarEnum.js.
    SALLY: 18,
    // god apply pass (2026-08-19): a genuinely new character, same treatment as SALLY —
    // `god.bb`'s own meta.json declares "raster": true (no vector/colormeta data at all), so
    // she compiles via `compile-raster-avatar.cjs`, not the vector pipeline. Parallel by
    // convention to server/src/enums/AvatarEnum.js.
    GOD: 19,
});

export default AvatarEnum;