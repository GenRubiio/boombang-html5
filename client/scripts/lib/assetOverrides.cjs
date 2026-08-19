// design.md §16.2 (tasks.md slice 11 task 3): maps an `asset-overrides/<char>/<kind>/<key>/
// <filename>` path onto its staged destination `.assets-src/accessories/<char>/<key>/
// <filename>` — the staged tree has no `kind` segment of its own (design.md §4's staging
// convention), so the override path's kind segment is informational/organizational only and
// dropped when resolving the destination.

const path = require('path');

/**
 * @param {string} relativeOverridePath e.g. `rasta/hat/minnieHat/_frames_down_idle.json`
 * @param {string} stagedAccessoriesRoot e.g. `<clientDir>/.assets-src/accessories`
 * @returns {string} the absolute destination path to overwrite after unzip, before compile
 */
function resolveOverrideDestination(relativeOverridePath, stagedAccessoriesRoot) {
  const segments = relativeOverridePath.split('/').filter(Boolean);
  if (segments.length !== 4) {
    throw new Error(
      `resolveOverrideDestination: malformed override path (expected <char>/<kind>/<key>/<filename>, got ${segments.length} segments): "${relativeOverridePath}"`
    );
  }
  const [character, , key, filename] = segments;
  return path.join(stagedAccessoriesRoot, character, key, filename);
}

module.exports = { resolveOverrideDestination };
