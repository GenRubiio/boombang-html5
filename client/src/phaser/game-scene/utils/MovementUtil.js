import DirectionEnum from "../enums/DirectionEnum.js";

class MovementUtil {
    static setDefaultFrame(player, direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                player.setFrame(46);//76
                break;
            case DirectionEnum.DOWN:
                player.setFrame(110); //125
                break;
            case DirectionEnum.DOWN_RIGHT:
                player.setFrame(61); //77
                break;
            case DirectionEnum.RIGHT:
                player.setFrame(93);  //109
                break;
            case DirectionEnum.UP_RIGHT:
                player.setFrame(35); //45
                break;
            case DirectionEnum.UP:
                player.setFrame(0); //15
                break;
            case DirectionEnum.UP_LEFT:
                player.setFrame(21); //44
                break;
            case DirectionEnum.LEFT:
                player.setFrame(78); //108
                break;
        }
    }
}

export default MovementUtil;