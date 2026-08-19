const Resource = require('./Resource');
const GameClock = require('../utils/GameClock');
const UserPaletteService = require('../services/UserPaletteService');

class UserResource extends Resource {
    transform(data) {
        // Gameplay defect fix (2026-08-19): UserResource is the SINGLE choke point every user
        // (bot or human) is serialized through — login, scene join, sync, and every
        // user-change-* broadcast — so seeding the glove slot here, before this payload is
        // built, guarantees no client ever falls through to the manifest's raw default hex
        // (root cause: PAL9's seeding step existed but was never called from any production
        // code path — see apply-progress.md).
        UserPaletteService.seedPaletteForResource(data, data.avatarId);
        return {
            game_time: GameClock.getCurrentGameTime(),
            id: data.socket.id,
            socket_id: data.socket.id,
            db_id: data.id,
            authJwt: data.authJwt,
            lang: data.lang,
            username: data.username,
            show_username: data.show_username !== undefined ? data.show_username : true,
            description: data.description,
            ficha_color: data.ficha_color,
            shadow_color: data.shadow_color,
            chat_color: data.chat_color,
            name_color: data.name_color,
            /**
             * Listas de personalización del usuario
             */
            fichas: data.fichas || [],
            chats: data.chats || [],
            shadows: data.shadows || [],
            colornames: data.colornames || [],
            avatars: data.avatars || [],
            /********************************/
            is_admin: false,
            is_vip: false,
            avatar_id: data.avatarId,
            gender: "man",
            x: data.currentAreaPosition ? data.currentAreaPosition.x : null,
            y: data.currentAreaPosition ? data.currentAreaPosition.y : null,
            z: data.currentAreaPosition ? data.currentAreaPosition.z : null,
            avatar_id: data.avatarId,
            gold_coins: data.goldCoins,
            silver_coins: data.silverCoins,
            rings_won: data.ringsWon,
            coconuts_caught: data.coconutsCaught,
            uppercuts_send: data.uppercutsSend,
            uppercuts_received: data.uppercutsReceived,
            coconuts_sent: data.coconutsSent,
            coconuts_received: data.coconutsReceived,
            kisses_sent: data.kissesSent,
            kisses_received: data.kissesReceived,
            drinks_sent: data.drinksSent,
            drinks_received: data.drinksReceived,
            roses_sent: data.rosesSent,
            roses_received: data.rosesReceived,
            uppercut_level: data.uppercutLevel,
            uppercut_selected: data.uppercutSelected,
            coconut_level: data.coconutLevel,
            coconut_selected: data.coconutSelected,
            // avatar-color-accessory-system (design.md §6, proposal.md risk 9): deliberately
            // placed here, not between the duplicate avatar_id assignments above (:31/:36).
            avatar_palette: data.avatarPalettes || {},
            accessories: data.accessories || { hat: null, pet: null, aura: null },
            owned_accessories: data.ownedAccessories || { hat: [], pet: [], aura: [] },

            phaser_rendering_type: data.phaser_rendering_type,
            phaser_antialias: data.phaser_antialias,
            phaser_antialias_gl: data.phaser_antialias_gl,
            phaser_pixel_art: data.phaser_pixel_art,
            phaser_round_pixels: data.phaser_round_pixels,
            phaser_power_preference: data.phaser_power_preference,
            phaser_scene_sound_volume: data.phaser_scene_sound_volume,
            phaser_scene_sound_muted: data.phaser_scene_sound_muted,

            animations: [],

            admin_tools: data.adminTools,

            lobby_tutorial: data.lobbyTutorial
        };
    }
}

module.exports = UserResource;