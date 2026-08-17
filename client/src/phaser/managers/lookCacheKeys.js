// Cache-key derivation for the three new artifact classes (design.md §2). Keys carry a class
// prefix containing `.` so they can never collide with the legacy `${avatarName}_atlas` /
// `${avatarName}_spreadsheet` keys AssetVersionManager.js/AvatarManager.js already write,
// none of which contain a `.` character (see the collision test in lookCacheKeys.test.js).

function layeredManifestKey(character, version) {
  return `lay.${character}_manifest_v${version}`;
}

function layeredAtlasKey(character, version, { page, name, sig } = {}) {
  let key = `lay.${character}_atlas_v${version}`;
  if (page !== undefined) key += `_p${page}`;
  if (name !== undefined) key += `::${name}`;
  if (sig !== undefined) key += `#${sig}`;
  return key;
}

function accessoryAtlasKey(kind, key, version) {
  return `acc.${kind}.${key}_atlas_v${version}`;
}

function accessoryManifestKey(kind, key, version) {
  return `acc.${kind}.${key}_manifest_v${version}`;
}

function auraSheetKey(key, version) {
  return `aur.${key}_sheet_v${version}`;
}

function auraManifestKey(key, version) {
  return `aur.${key}_manifest_v${version}`;
}

export {
  layeredManifestKey,
  layeredAtlasKey,
  accessoryAtlasKey,
  accessoryManifestKey,
  auraSheetKey,
  auraManifestKey,
};
