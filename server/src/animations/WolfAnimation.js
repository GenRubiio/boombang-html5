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
            return [
                {
                    key: user.socket.id + '_' + 'left_punch_doy_atlas_0',
                    base64: this.getBase64('left_punch_doy_atlas_0.png', folder, user),
                    link: 'left_punch_doy_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'right_punch_doy_atlas_0',
                    base64: this.getBase64('right_punch_doy_atlas_0.png', folder, user),
                    link: 'right_punch_doy_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'left_punch_rec_atlas_0',
                    base64: this.getBase64('left_punch_rec_atlas_0.png', folder, user),
                    link: 'left_punch_rec_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'right_punch_rec_atlas_0',
                    base64: this.getBase64('right_punch_rec_atlas_0.png', folder, user),
                    link: 'right_punch_rec_atlas_0',
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
            return [
                {
                    key: user.socket.id + '_' + 'up_walk_atlas_0',
                    base64: this.getBase64('up_walk_atlas_0.png', folder, user),
                    link: 'up_walk_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'up_idle_atlas_0',
                    base64: this.getBase64('up_idle_atlas_0.png', folder, user),
                    link: 'up_idle_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'leftup_walk_atlas_0',
                    base64: this.getBase64('leftup_walk_atlas_0.png', folder, user),
                    link: 'leftup_walk_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'rightup_walk_atlas_0',
                    base64: this.getBase64('rightup_walk_atlas_0.png', folder, user),
                    link: 'rightup_walk_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'leftup_idle_atlas_0',
                    base64: this.getBase64('leftup_idle_atlas_0.png', folder, user),
                    link: 'leftup_idle_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'rightup_idle_atlas_0',
                    base64: this.getBase64('rightup_idle_atlas_0.png', folder, user),
                    link: 'rightup_idle_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'leftdown_walk_atlas_0',
                    base64: this.getBase64('leftdown_walk_atlas_0.png', folder, user),
                    link: 'leftdown_walk_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'rightdown_walk_atlas_0',
                    base64: this.getBase64('rightdown_walk_atlas_0.png', folder, user),
                    link: 'rightdown_walk_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'leftdown_idle_atlas_0',
                    base64: this.getBase64('leftdown_idle_atlas_0.png', folder, user),
                    link: 'leftdown_idle_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'rightdown_idle_atlas_0',
                    base64: this.getBase64('rightdown_idle_atlas_0.png', folder, user),
                    link: 'rightdown_idle_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'left_walk_atlas_0',
                    base64: this.getBase64('left_walk_atlas_0.png', folder, user),
                    link: 'left_walk_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'right_walk_atlas_0',
                    base64: this.getBase64('right_walk_atlas_0.png', folder, user),
                    link: 'right_walk_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'left_idle_atlas_0',
                    base64: this.getBase64('left_idle_atlas_0.png', folder, user),
                    link: 'left_idle_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'right_idle_atlas_0',
                    base64: this.getBase64('right_idle_atlas_0.png', folder, user),
                    link: 'right_idle_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'down_walk_atlas_0',
                    base64: this.getBase64('down_walk_atlas_0.png', folder, user),
                    link: 'down_walk_atlas_0',
                },
                {
                    key: user.socket.id + '_' + 'down_idle_atlas_0',
                    base64: this.getBase64('down_idle_atlas_0.png', folder, user),
                    link: 'down_idle_atlas_0',
                },
            ];
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
}

module.exports = WolfAnimation;