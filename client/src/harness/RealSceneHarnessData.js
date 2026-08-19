// tasks.md slice 21 task 8: minimal, honest scene-init data for booting the REAL `PublicScene`
// class (not `AvatarHarnessScene`) with no server/socket/login dependency. This is deliberately
// disclosed as fabricated, not real-production, data — the distinguishing factor from
// `harness.html` is the SCENE CLASS and its real `create()` lifecycle (TintManager,
// PublicSceneLoader, AvatarSystemController.init, the tile/camera setup path), not the network
// layer, which stays absent either way (design.md §14 cost 19: "no server/API/DB/login
// dependency" is the harness's own stated cost, kept here too on purpose).
//
// Every field below is the minimum `PublicScene.create()` / `CreateSceneController.main()` reads
// without throwing, verified live by iterating through 3 real crashes (tasks.md slice 21, the
// same "RED by construction against real integration code" pattern this whole apply pass uses
// for I/O-shell tooling): (1) `PublicSceneLoader.#loadItems` iterates `scenery.items`
// unconditionally — needs `items: []`, not merely absent; (2) `CreateSceneController.createTile`
// reads `map[row][col]` — needs a real `game_map` array matching `map_rows`/`map_cols`, since
// this repo's own `.env` sets `VITE_ANIMATION_AVATAR_EDITOR=false`, which does NOT skip tile
// creation (the guard reads `=="false"` as "create the tile" — the flag names an editor MODE,
// not a disable switch, the opposite of what its name suggests); (3) Phaser auto-starts the
// first scene listed in `config.scene` before any explicit `game.scene.start(key, data)` call
// can supply real init data — fixed in `realSceneMain.js` by adding the scene with
// `autoStart: false` instead of listing it in `config.scene`. `arrows` and `sound`/`sound_url`
// absent so `#createArrows`/`#playSceneSound` no-op; `darkening: false` so no darkening overlay
// initializes; `assets_data.assets_data_repeatable: []` and `npc: null` so the rest of
// `PublicSceneLoader` loads nothing; `players: []` so `CreateSceneController.createUsers` spawns
// nobody automatically — `rasta` is spawned afterward through the SAME
// `window.__avatarHarness.spawnAvatar` (`spawnAvatarUser` -> the real `AddUserController.
// processUser`) that `harness.html` already uses, so the two harnesses share their spawn path
// and differ only in which scene class hosts it.

function buildRealSceneInitData(vueComponent) {
  return {
    sceneType: 'harness',
    vueComponent,
    sceneData: {
      scenery: {
        id: 'real-scene-harness',
        game_map: [[0]],
        map_rows: 1,
        map_cols: 1,
        big_scene: false,
        darkening: false,
        assets_data: { assets_data_repeatable: [] },
        items: [],
        npc: null,
        arrows: null,
        sound: null,
        sound_url: null,
        game_time: 0,
        base_api_url: '',
      },
      players: [],
      authUser: { id: 'real-scene-harness-auth', username: 'harness' },
    },
  };
}

/**
 * No-op stand-in for the real Vue component `PublicSceneScreen.vue` passes as `data.vueComponent`
 * (design.md §14 cost 19 — a near-production assembly path, not the full Vue/socket stack).
 * Every method here is one `PublicScene.js`/`AddUserController.js` calls on it somewhere in the
 * `create()` lifecycle or a UI button handler; all are no-ops since this harness drives the
 * scene programmatically, never through its own HTML buttons.
 */
function createNoOpVueComponent() {
  return {
    $emit() {},
    updateUserCard() {},
    showShop() {},
    showAvatarSelection() {},
    showRankings() {},
    showInventory() {},
  };
}

export { buildRealSceneInitData, createNoOpVueComponent };
