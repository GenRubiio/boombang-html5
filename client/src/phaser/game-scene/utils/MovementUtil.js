import DirectionEnum from "../enums/DirectionEnum.js";

class MovementUtil {
    static setDefaultFrame(id, spritePlayer, direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                spritePlayer.setTexture(id + "_" + "leftdown_idle");
                break;
            case DirectionEnum.DOWN:
                spritePlayer.setTexture(id + "_" + "down_idle");
                break;
            case DirectionEnum.DOWN_RIGHT:
                spritePlayer.setTexture(id + "_" + "rightdown_idle");
                break;
            case DirectionEnum.RIGHT:
                spritePlayer.setTexture(id + "_" + "right_idle");
                break;
            case DirectionEnum.UP_RIGHT:
                spritePlayer.setTexture(id + "_" + "rightup_idle");
                break;
            case DirectionEnum.UP:
                spritePlayer.setTexture(id + "_" + "up_idle");
                break;
            case DirectionEnum.UP_LEFT:
                spritePlayer.setTexture(id + "_" + "leftup_idle");
                break;
            case DirectionEnum.LEFT:
                spritePlayer.setTexture(id + "_" + "left_idle");
                break;
        }
    }
}

export default MovementUtil;