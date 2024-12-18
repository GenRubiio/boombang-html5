import DirectionEnum from "../enums/DirectionEnum.js";

class MovementUtil {
    static setDefaultFrame(id, spritePlayer, direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                spritePlayer.setTexture(id + "_" + "leftdown_idle_atlas_0");
                //spritePlayer.x = spritePlayer.x + 5;
                //spritePlayer.y = spritePlayer.y - 3;
                break;
            case DirectionEnum.DOWN:
                spritePlayer.setTexture(id + "_" + "down_idle_atlas_0");
                break;
            case DirectionEnum.DOWN_RIGHT:
                spritePlayer.setTexture(id + "_" + "rightdown_idle_atlas_0");
                break;
            case DirectionEnum.RIGHT:
                spritePlayer.setTexture(id + "_" + "right_idle_atlas_0");
                break;
            case DirectionEnum.UP_RIGHT:
                spritePlayer.setTexture(id + "_" + "rightup_idle_atlas_0");
                break;
            case DirectionEnum.UP:
                spritePlayer.setTexture(id + "_" + "up_idle_atlas_0");
                break;
            case DirectionEnum.UP_LEFT:
                spritePlayer.setTexture(id + "_" + "leftup_idle_atlas_0");
                break;
            case DirectionEnum.LEFT:
                spritePlayer.setTexture(id + "_" + "left_idle_atlas_0");
                break;
        }
    }

    static playDefaultFrame(id, spritePlayer, direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                spritePlayer.play(id + "_" + "leftdown_idle_atlas_0");
                break;
            case DirectionEnum.DOWN:
                spritePlayer.play(id + "_" + "down_idle_atlas_0");
                break;
            case DirectionEnum.DOWN_RIGHT:
                spritePlayer.play(id + "_" + "rightdown_idle_atlas_0");
                break;
            case DirectionEnum.RIGHT:
                spritePlayer.play(id + "_" + "right_idle_atlas_0");
                break;
            case DirectionEnum.UP_RIGHT:
                spritePlayer.play(id + "_" + "rightup_idle_atlas_0");
                break;
            case DirectionEnum.UP:
                spritePlayer.play(id + "_" + "up_idle_atlas_0");
                break;
            case DirectionEnum.UP_LEFT:
                spritePlayer.play(id + "_" + "leftup_idle_atlas_0");
                break;
            case DirectionEnum.LEFT:
                spritePlayer.play(id + "_" + "left_idle_atlas_0");
                break;
        }
    }
}

export default MovementUtil;