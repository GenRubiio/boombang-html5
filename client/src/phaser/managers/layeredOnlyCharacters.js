// design.md §15 (tasks.md slice 10 task 2): pure decision function backing
// `AvatarManager.loadAvatar`'s "layered-only character" rejection. A character with no baked
// art (sally) must reject immediately with the layered flag off or its package unavailable,
// rather than falling through to a baked loader that was never registered for it.

/**
 * @param {number} avatarId
 * @param {boolean} isLayeredUsable whatever `AvatarManager.isLayeredAvatar(avatarId)` (flag +
 *   compiled-package gate) currently resolves to
 * @param {Set<number>} layeredOnlyCharacters
 * @returns {boolean} true when `loadAvatar` must reject immediately
 */
function shouldRejectAsLayeredOnly(avatarId, isLayeredUsable, layeredOnlyCharacters) {
  return layeredOnlyCharacters.has(avatarId) && !isLayeredUsable;
}

export { shouldRejectAsLayeredOnly };
