const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const fs = require('fs');
const path = require('path');
const AvatarEnum = require('../enums/AvatarEnum');

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
            return {
                punch_doy_singleAtlas: {
                    base64: this.getBase64('punch_doy_singleAtlas.png', "animations/punch_doy", user),
                    atlas: this.getAtlas('punch_doy_singleAtlas.json', "interactions/punch_doy", AvatarEnum.WOLF)
                },
                punch_rec_singleAtlas: {
                    base64: this.getBase64('punch_rec_singleAtlas.png', "animations/punch_rec", user),
                    atlas: this.getAtlas('punch_rec_singleAtlas.json', "interactions/punch_rec", AvatarEnum.WOLF)
                },
            };
        } catch (err) {
            console.log(err);
            logger.log(`Error getting wolf animation: ${err.message}`, 'error');
            return null;
        }
    }

    static async getWalkAnimations(user) {
        try {
            return {
                walk_singleAtlas: {
                    base64: this.getBase64('walk_singleAtlas.png', "animations/walk", user),
                    atlas: this.getAtlas('walk_singleAtlas.json', "walk", AvatarEnum.WOLF)
                }
            };
        } catch (err) {
            console.log(err);
            logger.log(`Error getting wolf animation: ${err.message}`, 'error');
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

    static getAtlas(file, folder, avatar) {
        try {
            const filePath = path.join(
                __dirname,
                '../../assets/animations/avatars/' + avatar,
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
}

module.exports = WolfAnimation;