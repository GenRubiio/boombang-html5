import { describe, it, expect } from 'vitest';
import { findActiveGameplayScene } from './findActiveGameplayScene.js';

// avatar-system-multichar-fixes (coordinator addendum, character-switcher): reaches the live
// gameplay scene (Public/Private/Minigame) from OUTSIDE Phaser, the same lookup
// `PerfHarness._findActiveScene` already established (`window.game.scene.getScenes(true)`,
// picking the one scene that owns a `users` map) — pulled out here as a pure, injectable
// function (takes `game` as an argument instead of reading `window.game` itself) so the
// debug panel's live character-switch can reuse the identical rule without duplicating
// PerfHarness's own private method, and so the rule is directly unit-testable.
describe('findActiveGameplayScene', () => {
  it('returns null when there is no game instance yet', () => {
    expect(findActiveGameplayScene(null)).toBeNull();
  });

  it('returns null when the game has no active scene with a users map', () => {
    const game = { scene: { getScenes: () => [{ users: undefined }, {}] } };
    expect(findActiveGameplayScene(game)).toBeNull();
  });

  it('returns the one active scene that owns a users map', () => {
    const gameplayScene = { users: {} };
    const game = { scene: { getScenes: () => [{}, gameplayScene] } };
    expect(findActiveGameplayScene(game)).toBe(gameplayScene);
  });

  // Live-caught regression (confirmed against the real Docker-built client, not the bare
  // harness PerfHarness._findActiveScene was only ever exercised against): in the real boot
  // sequence PublicScene/PrivateScene/MinigameScene render and update without Phaser
  // considering them "active" (only the umbrella GlobalPreloader scene is) — an
  // active-only `getScenes(true)` call finds nothing once a real room is entered. Pins the
  // exact `getScenes(false)` call so this cannot silently regress back to active-only.
  it('asks getScenes for EVERY registered scene (false), not only Phaser-"active" ones', () => {
    const gameplayScene = { users: {} };
    let requestedActiveOnly = null;
    const game = {
      scene: {
        getScenes: (isActive) => {
          requestedActiveOnly = isActive;
          return [gameplayScene];
        },
      },
    };
    expect(findActiveGameplayScene(game)).toBe(gameplayScene);
    expect(requestedActiveOnly).toBe(false);
  });
});
