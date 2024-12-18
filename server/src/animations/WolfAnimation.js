const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const fs = require('fs');
const path = require('path');

class WolfAnimation {
    static async main(user) {
        try {
            return {
                walk: await this.getWalkAnimations(user),
                interaction: await this.getInteractionAnimations(user),
            }
        } catch (err) {
            logger.log(`Error getting wolf animation: ${err.message}`, 'error');
            return null;
        }
    }

    static async getInteractionAnimations(user) {
        try {
            const folder = "animations/interactions";
            const atlasFolder = "interactions";

            return [
                {
                    key: user.socket.id + '_' + 'left_punch_doy_atlas_0',
                    base64: this.getBase64('left_punch_doy_atlas_0.png', folder, user),
                    frames: { start: 1, end: 187 },
                    frameRate: 15,
                    frameWidth: 140,
                    frameHeight: 174,
                    has_atlas: true,
                    atlas: this.getAtlas('left_punch_doy_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'right_punch_doy_atlas_0',
                    base64: this.getBase64('right_punch_doy_atlas_0.png', folder, user),
                    frames: { start: 1, end: 187 },
                    frameRate: 15,
                    frameWidth: 140,
                    frameHeight: 174,
                    has_atlas: true,
                    atlas: this.getAtlas('right_punch_doy_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'left_punch_rec_atlas_0',
                    base64: this.getBase64('left_punch_rec_atlas_0.png', folder, user),
                    frames: { start: 1, end: 400 },
                    frameRate: 15,
                    frameWidth: 126,
                    frameHeight: 149,
                    has_atlas: true,
                    atlas: this.getAtlas('left_punch_rec_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'right_punch_rec_atlas_0',
                    base64: this.getBase64('right_punch_rec_atlas_0.png', folder, user),
                    frames: { start: 1, end: 400 },
                    frameRate: 15,
                    frameWidth: 126,
                    frameHeight: 149,
                    has_atlas: true,
                    atlas: this.getAtlas('right_punch_rec_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
            ];
        } catch (err) {
            console.log(err);
            logger.log(`Error getting wolf animation: ${err.message}`, 'error');
            return null;
        }
    }

    static async getWalkAnimations(user) {
        try {
            const folder = "animations/walk";
            const atlasFolder = "walk";

            return [
                {
                    key: user.socket.id + '_' + 'up_walk_atlas_0',
                    base64: this.getBase64('up_walk_atlas_0.png', folder, user),
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 102,
                    has_atlas: true,
                    atlas: this.getAtlas('up_walk_atlas_0.json', atlasFolder, user),
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'up_idle_atlas_0',
                    base64: this.getBase64('up_idle_atlas_0.png', folder, user),
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 98,
                    has_atlas: true,
                    atlas: this.getAtlas('up_idle_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'leftup_walk_atlas_0',
                    base64: this.getBase64('leftup_walk_atlas_0.png', folder, user),
                    frames: { start: 1, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 73,
                    frameHeight: 99,
                    has_atlas: true,
                    atlas: this.getAtlas('leftup_walk_atlas_0.json', atlasFolder, user),
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'rightup_walk_atlas_0',
                    base64: this.getBase64('rightup_walk_atlas_0.png', folder, user),
                    frames: { start: 1, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 73,
                    frameHeight: 99,
                    has_atlas: true,
                    atlas: this.getAtlas('rightup_walk_atlas_0.json', atlasFolder, user),
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'leftup_idle_atlas_0',
                    base64: this.getBase64('leftup_idle_atlas_0.png', folder, user),
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 94,
                    has_atlas: true,
                    atlas: this.getAtlas('leftup_idle_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'rightup_idle_atlas_0',
                    base64: this.getBase64('rightup_idle_atlas_0.png', folder, user),
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 94,
                    has_atlas: true,
                    atlas: this.getAtlas('rightup_idle_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'leftdown_walk_atlas_0',
                    base64: this.getBase64('leftdown_walk_atlas_0.png', folder, user),
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 104,
                    has_atlas: true,
                    atlas: this.getAtlas('leftdown_walk_atlas_0.json', atlasFolder, user),
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'rightdown_walk_atlas_0',
                    base64: this.getBase64('rightdown_walk_atlas_0.png', folder, user),
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 104,
                    has_atlas: true,
                    atlas: this.getAtlas('rightdown_walk_atlas_0.json', atlasFolder, user),
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'leftdown_idle_atlas_0',
                    base64: this.getBase64('leftdown_idle_atlas_0.png', folder, user),
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 71,
                    frameHeight: 98,
                    has_atlas: true,
                    atlas: this.getAtlas('leftdown_idle_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'rightdown_idle_atlas_0',
                    base64: this.getBase64('rightdown_idle_atlas_0.png', folder, user),
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 71,
                    frameHeight: 98,
                    has_atlas: true,
                    atlas: this.getAtlas('rightdown_idle_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'left_walk_atlas_0',
                    base64: this.getBase64('left_walk_atlas_0.png', folder, user),
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 74,
                    frameHeight: 102,
                    has_atlas: true,
                    atlas: this.getAtlas('left_walk_atlas_0.json', atlasFolder, user),
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'right_walk_atlas_0',
                    base64: this.getBase64('right_walk_atlas_0.png', folder, user),
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 74,
                    frameHeight: 102,
                    has_atlas: true,
                    atlas: this.getAtlas('right_walk_atlas_0.json', atlasFolder, user),
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'left_idle_atlas_0',
                    base64: this.getBase64('left_idle_atlas_0.png', folder, user),
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 98,
                    has_atlas: true,
                    atlas: this.getAtlas('left_idle_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'right_idle_atlas_0',
                    base64: this.getBase64('right_idle_atlas_0.png', folder, user),
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 98,
                    has_atlas: true,
                    atlas: this.getAtlas('right_idle_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'down_walk_atlas_0',
                    base64: this.getBase64('down_walk_atlas_0.png', folder, user),
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 102,
                    has_atlas: true,
                    atlas: this.getAtlas('down_walk_atlas_0.json', atlasFolder, user),
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'down_idle_atlas_0',
                    base64: this.getBase64('down_idle_atlas_0.png', folder, user),
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((0 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 98,
                    has_atlas: true,
                    atlas: this.getAtlas('down_idle_atlas_0.json', atlasFolder, user),
                    repeat: 0
                },
            ];
        } catch (err) {
            console.log(err);
            logger.log(`Error getting wolf animation: ${err.message}`, 'error');
            return null;
        }
    }

    static getAtlas(file, folder) {
        try {
            const filePath = path.join(
                __dirname,
                '../../assets/animations/avatars/1',
                folder,
                file
            );

            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            return fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            logger.log(`Error reading file ${file}: ${err.message}`, 'error');
            return null;
        }
    }

    static getBase64(file, folder, user) {
        try {
            const filePath = path.join(
                __dirname,
                '../../assets/users',
                String(user.id),
                folder,
                file
            );

            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            const imageBuffer = fs.readFileSync(filePath);
            return `data:image/png;base64,${imageBuffer.toString('base64')}`;
        } catch (err) {
            logger.log(`Error reading file ${file}: ${err.message}`, 'error');
            return null;
        }
    }
}

module.exports = WolfAnimation;