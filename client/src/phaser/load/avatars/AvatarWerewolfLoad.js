import down_walk_png from '../../../assets/game/avatars/1/animations/down_walk.png';
import down_walk_json from '../../../assets/game/avatars/1/animations/down_walk_atlas.json';
import down_idle_png from '../../../assets/game/avatars/1/animations/down_idle.png';
import down_idle_json from '../../../assets/game/avatars/1/animations/down_idle_atlas.json';
import left_walk_png from '../../../assets/game/avatars/1/animations/left_walk.png';
import left_walk_json from '../../../assets/game/avatars/1/animations/left_walk_atlas.json';
import left_idle_png from '../../../assets/game/avatars/1/animations/left_idle.png';
import left_idle_json from '../../../assets/game/avatars/1/animations/left_idle_atlas.json';
import up_walk_png from '../../../assets/game/avatars/1/animations/up_walk.png';
import up_walk_json from '../../../assets/game/avatars/1/animations/up_walk_atlas.json';
import up_idle_png from '../../../assets/game/avatars/1/animations/up_idle.png';
import up_idle_json from '../../../assets/game/avatars/1/animations/up_idle_atlas.json';
import left_punch_doy_png from '../../../assets/game/avatars/1/animations/left_punch_doy.png';
import left_punch_doy_json from '../../../assets/game/avatars/1/animations/left_punch_doy_atlas.json';
import left_punch_rec_png from '../../../assets/game/avatars/1/animations/left_punch_rec.png';
import left_punch_rec_json from '../../../assets/game/avatars/1/animations/left_punch_rec_atlas.json';
import leftdown_walk_png from '../../../assets/game/avatars/1/animations/leftdown_walk.png';
import leftdown_walk_json from '../../../assets/game/avatars/1/animations/leftdown_walk_atlas.json';
import leftdown_idle_png from '../../../assets/game/avatars/1/animations/leftdown_idle.png';
import leftdown_idle_json from '../../../assets/game/avatars/1/animations/leftdown_idle_atlas.json';
import leftup_walk_png from '../../../assets/game/avatars/1/animations/leftup_walk.png';
import leftup_walk_json from '../../../assets/game/avatars/1/animations/leftup_walk_atlas.json';
import leftup_idle_png from '../../../assets/game/avatars/1/animations/leftup_idle.png';
import leftup_idle_json from '../../../assets/game/avatars/1/animations/leftup_idle_atlas.json';

import AvatarsEnum from '../../enums/AvatarsEnum';

class AvatarWerewolfLoad {
    static main(gameScene) {
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_down_walk', down_walk_png, down_walk_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_down_idle', down_idle_png, down_idle_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_left_walk', left_walk_png, left_walk_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_left_idle', left_idle_png, left_idle_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_up_walk', up_walk_png, up_walk_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_up_idle', up_idle_png, up_idle_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_left_punch_doy', left_punch_doy_png, left_punch_doy_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_left_punch_rec', left_punch_rec_png, left_punch_rec_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_leftdown_walk', leftdown_walk_png, leftdown_walk_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_leftdown_idle', leftdown_idle_png, leftdown_idle_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_leftup_walk', leftup_walk_png, leftup_walk_json);
        gameScene.load.atlas(AvatarsEnum.WEREWOLF + '_leftup_idle', leftup_idle_png, leftup_idle_json);
    }
}

export default AvatarWerewolfLoad;
