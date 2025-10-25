const Resource = require('./Resource');
const GameClock = require('../utils/GameClock');

class UserResource extends Resource {
    transform(data) {
        return {
            game_time: GameClock.getCurrentGameTime(),
            id: data.socket.id,
            socket_id: data.socket.id,
            db_id: data.id,
            authJwt: data.authJwt,
            lang: data.lang,
            username: data.username,
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
            uppercut_level: data.uppercutLevel,
            uppercut_selected: data.uppercutSelected,
            coconut_level: data.coconutLevel,
            coconut_selected: data.coconutSelected,

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
        };
    }
}

module.exports = UserResource;