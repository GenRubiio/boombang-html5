/*
    Configuración para manejar assets de alta resolución (DPI)
    Puedes ajustar el factor de escala según tus necesidades.
*/

const gameConfig = {
    DPI: 2, // Factor de escala para assets (1 = normal, 2 = alta resolución)
    GAME_WIDTH: 1012, // Ancho lógico del juego
    GAME_HEIGHT: 657, // Alto lógico del juego
    // Feature flags read once here so checks are not scattered `import.meta.env` reads
    // (design.md §4, §7). PERF_HARNESS gates the FPS/draw-call measurement tool (Slice 0).
    PERF_HARNESS: import.meta.env.VITE_PERF_HARNESS === "true",
    // LAYERED_AVATARS gates the layered renderer strategy branch (design.md §4). With this
    // false, AvatarManager.isLayeredAvatar() always returns false and every avatar renders
    // via the existing baked-atlas path, unchanged (LR6 "flag off" scenario).
    LAYERED_AVATARS: import.meta.env.VITE_LAYERED_AVATARS === "true",
    // AVATAR_BUNDLES gates the .bb delivery-bundle load path (design.md §9.2, tasks.md slice
    // 16). With this false (default), every layered package loads per-file via Vite's own
    // `import.meta.glob`, unchanged. With this true, the base pack loads as ONE `/bundles/
    // <char>.layers.bb` fetch, unpacked in memory via `fflate` — a request-count reduction now
    // that compression is already on at the origin (slice 13), per design's own honest framing:
    // with bytes already compressed, bundling's remaining win is request count, not bytes.
    AVATAR_BUNDLES: import.meta.env.VITE_AVATAR_BUNDLES === "true",
    // FORCE_DAYLIGHT: a temporary, client-side, dev/validation-only affordance requested by
    // the user during live validation of avatar-color-accessory-system — NOT part of any
    // frozen spec for that change. With this false (default), behaviour is byte-for-byte
    // identical to today (PublicScene.js still computes/applies day-night darkening exactly
    // as before). With this true, PublicScene.js skips the darkening overlay entirely so every
    // room renders at full daylight. Never touches server/src/utils/GameClock.js or any room's
    // stored `darkening` data — purely a client-side rendering skip, remove when no longer
    // needed for validation.
    FORCE_DAYLIGHT: import.meta.env.VITE_FORCE_DAYLIGHT === "true",
};

export default gameConfig;
