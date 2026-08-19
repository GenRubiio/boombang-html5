// avatar-system-multichar-fixes (coordinator addendum, character-switcher): finds the
// gameplay scene (Public/Private/Minigame) that owns a `users` map of live avatar containers,
// from OUTSIDE Phaser. Started as the same rule `PerfHarness._findActiveScene` already
// established (design.md §7, LR8: `game.scene.getScenes(true)`, active-only) — LIVE-CAUGHT
// DEFECT against the real running game (not the bare harness `PerfHarness` was only ever
// exercised against): `getScenes(true)` filters to scenes Phaser considers "active"
// (`sys.isActive()`), and in the real boot sequence `PublicScene`/`PrivateScene`/
// `MinigameScene` render and update while NOT marked active this way (only the umbrella
// `GlobalPreloader` scene is), so the active-only filter found nothing once a real room was
// entered — confirmed live via `window.game.scene.scenes.map(s => s.sys.isActive())` against
// the running Docker-built client. Fixed by passing `false` (every registered scene,
// regardless of Phaser's own active flag) and relying on the `users` map as the real
// discriminator, exactly like the original rule already did for GlobalPreloader (which has
// none). This is a real, disclosed gap in `PerfHarness`'s own precedent, left unfixed there
// (out of this task's scope, and it has only ever been exercised against harness pages, where
// this distinction does not arise) but corrected here since this function is exercised
// against the real game.

/**
 * @param {{scene?: {getScenes: (active: boolean) => object[]}}|null|undefined} game typically
 *   `window.game`, injected rather than read globally so this function has no hidden I/O.
 * @returns {object|null} the one scene with a `users` map, or null if there is none.
 */
function findActiveGameplayScene(game) {
  if (!game || !game.scene) return null;
  const scenes = game.scene.getScenes(false);
  return scenes.find((scene) => scene && scene.users && typeof scene.users === 'object') || null;
}

export { findActiveGameplayScene };
