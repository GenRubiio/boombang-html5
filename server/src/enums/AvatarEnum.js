const Enum = require('./Enum');

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
    // character (a new id, not a migration of an existing one — proposal.md item 7 expected
    // her to drop out; §0's user-approved scope expansion satisfies the LR delta as written
    // instead). Parallel by convention to the client's own AvatarEnum.js.
    SALLY: 18,
    // god apply pass (2026-08-19): a genuinely new character, registered the same way SALLY
    // was. Parallel by convention to the client's own AvatarEnum.js.
    GOD: 19,
});

module.exports = AvatarEnum;