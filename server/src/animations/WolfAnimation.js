const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const fs = require('fs');
const path = require('path');
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');

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
                    key: user.socket.id + '_' + 'left_punch_doy',
                    base64: this.getBase64('left_punch_doy.png', folder, user),
                    frames: { start: 0, end: 186 },
                    frameRate: (Math.round((186 / AnimationBlockTimerEnum.UPPERCUT_SEND))),
                    frameWidth: 140,
                    frameHeight: 174,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'right_punch_doy',
                    base64: this.getBase64('right_punch_doy.png', folder, user),
                    frames: { start: 0, end: 186 },
                    frameRate: (Math.round((186 / AnimationBlockTimerEnum.UPPERCUT_SEND))),
                    frameWidth: 140,
                    frameHeight: 174,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'left_punch_rec',
                    base64: this.getBase64('left_punch_rec.png', folder, user),
                    frames: { start: 0, end: 399 },
                    frameRate: (Math.round((399 / AnimationBlockTimerEnum.UPPERCUT_RECEIVE))),
                    frameWidth: 126,
                    frameHeight: 149,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'right_punch_rec',
                    base64: this.getBase64('right_punch_rec.png', folder, user),
                    frames: { start: 0, end: 399 },
                    frameRate: (Math.round((399 / AnimationBlockTimerEnum.UPPERCUT_RECEIVE))),
                    frameWidth: 126,
                    frameHeight: 149,
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

            return [
                {
                    key: user.socket.id + '_' + 'up_walk',
                    base64: this.getBase64('up_walk.png', folder, user),
                    frames: { start: 0, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 102,
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'up_idle',
                    base64: this.getBase64('up_idle.png', folder, user),
                    frames: { start: 0, end: 0 },
                    frameRate: (Math.round((0 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 98,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'leftup_walk',
                    base64: this.getBase64('leftup_walk.png', folder, user),
                    frames: { start: 0, end: 13 },
                    frameRate: (Math.round((13 / 0.75))),
                    frameWidth: 73,
                    frameHeight: 99,
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'rightup_walk',
                    base64: this.getBase64('rightup_walk.png', folder, user),
                    frames: { start: 0, end: 13 },
                    frameRate: (Math.round((13 / 0.75))),
                    frameWidth: 73,
                    frameHeight: 99,
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'leftup_idle',
                    base64: this.getBase64('leftup_idle.png', folder, user),
                    frames: { start: 0, end: 0 },
                    frameRate: (Math.round((0 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 94,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'rightup_idle',
                    base64: this.getBase64('rightup_idle.png', folder, user),
                    frames: { start: 0, end: 0 },
                    frameRate: (Math.round((0 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 94,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'leftdown_walk',
                    base64: this.getBase64('leftdown_walk.png', folder, user),
                    frames: { start: 0, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 104,
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'rightdown_walk',
                    base64: this.getBase64('rightdown_walk.png', folder, user),
                    frames: { start: 0, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 104,
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'leftdown_idle',
                    base64: this.getBase64('leftdown_idle.png', folder, user),
                    frames: { start: 0, end: 0 },
                    frameRate: (Math.round((0 / 0.75))),
                    frameWidth: 71,
                    frameHeight: 98,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'rightdown_idle',
                    base64: this.getBase64('rightdown_idle.png', folder, user),
                    frames: { start: 0, end: 0 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 71,
                    frameHeight: 98,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'left_walk',
                    base64: this.getBase64('left_walk.png', folder, user),
                    frames: { start: 0, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 74,
                    frameHeight: 102,
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'right_walk',
                    base64: this.getBase64('right_walk.png', folder, user),
                    frames: { start: 0, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 74,
                    frameHeight: 102,
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'left_idle',
                    base64: this.getBase64('left_idle.png', folder, user),
                    frames: { start: 0, end: 0 },
                    frameRate: (Math.round((0 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 98,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'right_idle',
                    base64: this.getBase64('right_idle.png', folder, user),
                    frames: { start: 0, end: 0 },
                    frameRate: (Math.round((0 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 98,
                    repeat: 0
                },
                {
                    key: user.socket.id + '_' + 'down_walk',
                    base64: this.getBase64('down_walk.png', folder, user),
                    frames: { start: 0, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 102,
                    repeat: -1
                },
                {
                    key: user.socket.id + '_' + 'down_idle',
                    base64: this.getBase64('down_idle.png', folder, user),
                    frames: { start: 0, end: 0 },
                    frameRate: (Math.round((0 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 98,
                    repeat: 0
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