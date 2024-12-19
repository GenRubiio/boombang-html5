const AvatarAnimationsCollection = require('../collections/AvatarAnimationsCollection');
const fs = require('fs');
const path = require('path');
const AvatarEnum = require('../enums/AvatarEnum');
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();

class LoadAvatarAnimationsTask {
    static main() {
        this.loadWolfAnimations();
    }

    static loadWolfAnimations() {
        AvatarAnimationsCollection.add(AvatarEnum.WOLF, {
            left_punch_doy_atlas_0: {
                avatar: AvatarEnum.WOLF,
                key: 'left_punch_doy_atlas_0',
                frames: { start: 1, end: 187 },
                frameRate: 15,
                frameWidth: 140,
                frameHeight: 174,
                has_atlas: true,
                atlas: this.getAtlas('left_punch_doy_atlas_0.json', "interactions", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 10,
                repeat: 0
            },
            right_punch_doy_atlas_0: {
                avatar: AvatarEnum.WOLF,
                key: 'right_punch_doy_atlas_0',
                frames: { start: 1, end: 187 },
                frameRate: 15,
                frameWidth: 140,
                frameHeight: 174,
                has_atlas: true,
                atlas: this.getAtlas('right_punch_doy_atlas_0.json', "interactions", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 10,
                repeat: 0
            },
            left_punch_rec_atlas_0: {
                avatar: AvatarEnum.WOLF,
                key: 'left_punch_rec_atlas_0',
                frames: { start: 1, end: 400 },
                frameRate: 15,
                frameWidth: 126,
                frameHeight: 149,
                has_atlas: true,
                atlas: this.getAtlas('left_punch_rec_atlas_0.json', "interactions", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 20,
                repeat: 0
            },
            right_punch_rec_atlas_0: {
                avatar: AvatarEnum.WOLF,
                key: 'right_punch_rec_atlas_0',
                frames: { start: 1, end: 400 },
                frameRate: 15,
                frameWidth: 126,
                frameHeight: 149,
                has_atlas: true,
                atlas: this.getAtlas('right_punch_rec_atlas_0.json', "interactions", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 20,
                repeat: 0
            },
            up_walk_atlas_0: {
                avatar: AvatarEnum.WOLF,
                key: 'up_walk_atlas_0',
                frames: { start: 1, end: 15 },
                frameRate: (Math.round((15 / 0.75))),
                frameWidth: 75,
                frameHeight: 102,
                has_atlas: true,
                atlas: this.getAtlas('up_walk_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: -1
            },
            up_idle_atlas_0: {
                avatar: AvatarEnum.WOLF,
                key: 'up_idle_atlas_0',
                frames: { start: 1, end: 1 },
                frameRate: (Math.round((1 / 0.75))),
                frameWidth: 75,
                frameHeight: 98,
                has_atlas: true,
                atlas: this.getAtlas('up_idle_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: 0
            },
            leftup_walk_atlas_0: {
                avatar: AvatarEnum.WOLF,
                key: 'leftup_walk_atlas_0',
                frames: { start: 1, end: 14 },
                frameRate: (Math.round((14 / 0.75))),
                frameWidth: 73,
                frameHeight: 99,
                has_atlas: true,
                atlas: this.getAtlas('leftup_walk_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: -1
            },
            rightup_walk_atlas_0: {
                avatar: AvatarEnum.WOLF,
                key: 'rightup_walk_atlas_0',
                frames: { start: 1, end: 14 },
                frameRate: (Math.round((14 / 0.75))),
                frameWidth: 73,
                frameHeight: 99,
                has_atlas: true,
                atlas: this.getAtlas('rightup_walk_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: -1
            },
            leftup_idle_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'leftup_idle_atlas_0',
                frames: { start: 1, end: 1 },
                frameRate: (Math.round((1 / 0.75))),
                frameWidth: 69,
                frameHeight: 94,
                has_atlas: true,
                atlas: this.getAtlas('leftup_idle_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: 0
            },
            rightup_idle_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'rightup_idle_atlas_0',
                frames: { start: 1, end: 1 },
                frameRate: (Math.round((1 / 0.75))),
                frameWidth: 69,
                frameHeight: 94,
                has_atlas: true,
                atlas: this.getAtlas('rightup_idle_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: 0
            },
            leftdown_walk_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'leftdown_walk_atlas_0',
                frames: { start: 1, end: 15 },
                frameRate: (Math.round((15 / 0.75))),
                frameWidth: 75,
                frameHeight: 104,
                has_atlas: true,
                atlas: this.getAtlas('leftdown_walk_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: -1
            },
            rightdown_walk_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'rightdown_walk_atlas_0',
                frames: { start: 1, end: 15 },
                frameRate: (Math.round((15 / 0.75))),
                frameWidth: 75,
                frameHeight: 104,
                has_atlas: true,
                atlas: this.getAtlas('rightdown_walk_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: -1
            },
            leftdown_idle_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'leftdown_idle_atlas_0',
                frames: { start: 1, end: 1 },
                frameRate: (Math.round((1 / 0.75))),
                frameWidth: 71,
                frameHeight: 98,
                has_atlas: true,
                atlas: this.getAtlas('leftdown_idle_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: 0
            },
            rightdown_idle_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'rightdown_idle_atlas_0',
                frames: { start: 1, end: 1 },
                frameRate: (Math.round((1 / 0.75))),
                frameWidth: 71,
                frameHeight: 98,
                has_atlas: true,
                atlas: this.getAtlas('rightdown_idle_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: 0
            },
            left_walk_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'left_walk_atlas_0',
                frames: { start: 1, end: 15 },
                frameRate: (Math.round((15 / 0.75))),
                frameWidth: 74,
                frameHeight: 102,
                has_atlas: true,
                atlas: this.getAtlas('left_walk_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: -1
            },
            right_walk_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'right_walk_atlas_0',
                frames: { start: 1, end: 15 },
                frameRate: (Math.round((15 / 0.75))),
                frameWidth: 74,
                frameHeight: 102,
                has_atlas: true,
                atlas: this.getAtlas('right_walk_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: -1
            },
            left_idle_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'left_idle_atlas_0',
                frames: { start: 1, end: 1 },
                frameRate: (Math.round((1 / 0.75))),
                frameWidth: 69,
                frameHeight: 98,
                has_atlas: true,
                atlas: this.getAtlas('left_idle_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: 0
            },
            right_idle_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'right_idle_atlas_0',
                frames: { start: 1, end: 1 },
                frameRate: (Math.round((1 / 0.75))),
                frameWidth: 69,
                frameHeight: 98,
                has_atlas: true,
                atlas: this.getAtlas('right_idle_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: 0
            },
            down_walk_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'down_walk_atlas_0',
                frames: { start: 1, end: 15 },
                frameRate: (Math.round((15 / 0.75))),
                frameWidth: 75,
                frameHeight: 102,
                has_atlas: true,
                atlas: this.getAtlas('down_walk_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: -1
            },
            down_idle_atlas_0: {
                vatar: AvatarEnum.WOLF,
                key: 'down_idle_atlas_0',
                frames: { start: 1, end: 1 },
                frameRate: (Math.round((0 / 0.75))),
                frameWidth: 75,
                frameHeight: 98,
                has_atlas: true,
                atlas: this.getAtlas('down_idle_atlas_0.json', "walk", AvatarEnum.WOLF),
                originX: 0.5,
                originY: 0.5,
                offsetX: 0,
                offsetY: 0,
                repeat: 0
            }
        });
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

module.exports = LoadAvatarAnimationsTask;