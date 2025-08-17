const Resource = require('./Resource');

class UserResource extends Resource {
    transform(data) {
        return {
            id: data.socket.id,
            socket_id: data.socket.id,
            db_id: data.id,
            username: data.username,
            description: data.description,
            ficha_color: data.ficha_color,
            shadow_color: data.shadow_color,
            chat_color: data.chat_color,
            name_color: data.name_color,
            fichas: data.fichas || [],
            chats: data.chats || [],
            shadows: data.shadows || [],
            colornames: data.colornames || [],
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
            animations: [],
        };
    }
}

module.exports = UserResource;