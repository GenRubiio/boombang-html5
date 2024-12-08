import DirectionEnum from "../enums/DirectionEnum.js";

class MovementUtil {
    static setDefaultFrame(id, player, direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                player.setTexture(id + "_" + "leftdown_idle");
                break;
            case DirectionEnum.DOWN:
                player.setTexture(id + "_" + "down_idle");
                break;
            case DirectionEnum.DOWN_RIGHT:
                player.setTexture(id + "_" + "rightdown_idle");
                break;
            case DirectionEnum.RIGHT:
                player.setTexture(id + "_" + "right_idle");
                break;
            case DirectionEnum.UP_RIGHT:
                player.setTexture(id + "_" + "rightup_idle");
                break;
            case DirectionEnum.UP:
                player.setTexture(id + "_" + "up_idle");
                break;
            case DirectionEnum.UP_LEFT:
                player.setTexture(id + "_" + "leftup_idle");
                break;
            case DirectionEnum.LEFT:
                player.setTexture(id + "_" + "left_idle");
                break;
        }
    }
}

export default MovementUtil;