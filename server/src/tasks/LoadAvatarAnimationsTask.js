const AvatarAnimationsCollection = require('../collections/AvatarAnimationsCollection');
const AvatarEnum = require('../enums/AvatarEnum');

class LoadAvatarAnimationsTask {
    static main() {
        this.loadWolfAnimations();
    }

    static loadWolfAnimations() {
        AvatarAnimationsCollection.add(AvatarEnum.WOLF, {
            walk_singleAtlas: {
                up_walk: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'up_walk_',
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 102,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: -1
                },
                up_idle: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'up_idle_',
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 98,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: 0
                },
                leftup_walk: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'leftup_walk_',
                    frames: { start: 1, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 73,
                    frameHeight: 99,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: -1
                },
                rightup_walk: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'rightup_walk_',
                    frames: { start: 1, end: 14 },
                    frameRate: (Math.round((14 / 0.75))),
                    frameWidth: 73,
                    frameHeight: 99,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: -1
                },
                leftup_idle: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'leftup_idle_',
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 94,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: 0
                },
                rightup_idle: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'rightup_idle_',
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 94,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: 0
                },
                leftdown_walk: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'leftdown_walk_',
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 104,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: -1
                },
                rightdown_walk: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'rightdown_walk_',
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 104,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: -1
                },
                leftdown_idle: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'leftdown_idle_',
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 71,
                    frameHeight: 98,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: 0
                },
                rightdown_idle: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'rightdown_idle_',
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 71,
                    frameHeight: 98,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: 0
                },
                left_walk: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'left_walk_',
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 74,
                    frameHeight: 102,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: -1
                },
                right_walk: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'right_walk_',
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 74,
                    frameHeight: 102,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: -1
                },
                left_idle: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'left_idle_',
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 98,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: 0
                },
                right_idle: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'right_idle_',
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((1 / 0.75))),
                    frameWidth: 69,
                    frameHeight: 98,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: 0
                },
                down_walk: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'down_walk_',
                    frames: { start: 1, end: 15 },
                    frameRate: (Math.round((15 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 102,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: -1
                },
                down_idle: {
                    atlas: 'walk_singleAtlas',
                    prefix: 'down_idle_',
                    frames: { start: 1, end: 1 },
                    frameRate: (Math.round((0 / 0.75))),
                    frameWidth: 75,
                    frameHeight: 98,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 0,
                    repeat: 0
                }
            },
            punch_doy_singleAtlas: {
                left_punch_doy: {
                    atlas: 'punch_doy_singleAtlas',
                    prefix: 'left_punch_doy_',
                    frames: { start: 1, end: 187 },
                    frameRate: 15,
                    frameWidth: 140,
                    frameHeight: 174,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 10,
                    repeat: 0
                },
                right_punch_doy: {
                    atlas: 'punch_doy_singleAtlas',
                    prefix: 'right_punch_doy_',
                    frames: { start: 1, end: 187 },
                    frameRate: 15,
                    frameWidth: 140,
                    frameHeight: 174,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 10,
                    repeat: 0
                }
            },
            punch_rec_singleAtlas: {
                left_punch_rec: {
                    atlas: 'punch_rec_singleAtlas',
                    prefix: 'left_punch_rec_',
                    frames: { start: 1, end: 400 },
                    frameRate: 15,
                    frameWidth: 126,
                    frameHeight: 149,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 20,
                    repeat: 0
                },
                right_punch_rec: {
                    atlas: 'punch_rec_singleAtlas',
                    prefix: 'right_punch_rec_',
                    frames: { start: 1, end: 400 },
                    frameRate: 15,
                    frameWidth: 126,
                    frameHeight: 149,
                    originX: 0.5,
                    originY: 0.5,
                    offsetX: 0,
                    offsetY: 20,
                    repeat: 0
                }
            },
        });
    }
}

module.exports = LoadAvatarAnimationsTask;