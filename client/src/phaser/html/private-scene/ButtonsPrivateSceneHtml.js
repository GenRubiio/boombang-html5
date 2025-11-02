import i18n from "@/plugins/i18n";
import shopIcon from "@/assets/game/scene/ui/shop.webp";
import avatarsIcon from "@/assets/game/scene/ui/avatars.webp";
import colorSceneIcon from "@/assets/game/scene/ui/color_scene.webp";
import moveItemIcon from "@/assets/game/scene/ui/move_item.webp";
import backpackIcon from "@/assets/game/scene/ui/backpack.webp";
import rankingsIcon from "@/assets/game/scene/ui/ranking.webp"; // Reutilizando el ícono por ahora

class ButtonsPrivateSceneHtml {
    static load(isOwner = false) {
        // Botones comunes para todos los usuarios (shop, avatars, rankings)
        const commonButtons = `
            <div class="scene-button" data-action="shop" style="
                width: 45px;
                height: 45px;
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid #cccccc;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
            ">
                <img src="${shopIcon}" style="max-width: 37px;">
                <div class="tooltip" style="
                    position: absolute;
                    top: 50%;
                    left: 60px;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 10001;
                ">${i18n.global.t('scene.tooltip_shop')}
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: -8px;
                        transform: translateY(-50%);
                        width: 0;
                        height: 0;
                        border-top: 8px solid transparent;
                        border-bottom: 8px solid transparent;
                        border-right: 8px solid rgba(0, 0, 0, 0.8);
                    "></div>
                </div>
            </div>

            <div class="scene-button" data-action="avatars" style="
                width: 45px;
                height: 45px;
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid #cccccc;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
            ">
                <img src="${avatarsIcon}" style="max-width: 37px;">
                <div class="tooltip" style="
                    position: absolute;
                    top: 50%;
                    left: 60px;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 10001;
                ">${i18n.global.t('scene.tooltip_avatars')}
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: -8px;
                        transform: translateY(-50%);
                        width: 0;
                        height: 0;
                        border-top: 8px solid transparent;
                        border-bottom: 8px solid transparent;
                        border-right: 8px solid rgba(0, 0, 0, 0.8);
                    "></div>
                </div>
            </div>

            <div class="scene-button" data-action="rankings" style="
                width: 45px;
                height: 45px;
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid #cccccc;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
            ">
                <img src="${rankingsIcon}" style="max-width: 37px;">
                <div class="tooltip" style="
                    position: absolute;
                    top: 50%;
                    left: 60px;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 10001;
                ">${i18n.global.t('scene.tooltip_rankings')}
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: -8px;
                        transform: translateY(-50%);
                        width: 0;
                        height: 0;
                        border-top: 8px solid transparent;
                        border-bottom: 8px solid transparent;
                        border-right: 8px solid rgba(0, 0, 0, 0.8);
                    "></div>
                </div>
            </div>
        `;

        // Botones solo para el propietario (color, move, inventory)
        const ownerButtons = `
            <div class="scene-button" data-action="color" style="
                width: 45px;
                height: 45px;
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid #cccccc;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
            ">
                <img src="${colorSceneIcon}" style="max-width: 37px;">
                <div class="tooltip" style="
                    position: absolute;
                    top: 50%;
                    left: 60px;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 10001;
                ">${i18n.global.t('scene.tooltip_color')}
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: -8px;
                        transform: translateY(-50%);
                        width: 0;
                        height: 0;
                        border-top: 8px solid transparent;
                        border-bottom: 8px solid transparent;
                        border-right: 8px solid rgba(0, 0, 0, 0.8);
                    "></div>
                </div>
            </div>

            <div class="scene-button" data-action="move" id="move-button" style="
                width: 45px;
                height: 45px;
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid #cccccc;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
            ">
                <img src="${moveItemIcon}" style="max-width: 37px;">
                <div class="tooltip" style="
                    position: absolute;
                    top: 50%;
                    left: 60px;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 10001;
                ">${i18n.global.t('scene.tooltip_move')}
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: -8px;
                        transform: translateY(-50%);
                        width: 0;
                        height: 0;
                        border-top: 8px solid transparent;
                        border-bottom: 8px solid transparent;
                        border-right: 8px solid rgba(0, 0, 0, 0.8);
                    "></div>
                </div>
            </div>

            <div class="scene-button" data-action="inventory" style="
                width: 45px;
                height: 45px;
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid #cccccc;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
            ">
                <img src="${backpackIcon}" style="max-width: 37px;">
                <div class="tooltip" style="
                    position: absolute;
                    top: 50%;
                    left: 60px;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 10001;
                ">${i18n.global.t('scene.tooltip_inventory')}
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: -8px;
                        transform: translateY(-50%);
                        width: 0;
                        height: 0;
                        border-top: 8px solid transparent;
                        border-bottom: 8px solid transparent;
                        border-right: 8px solid rgba(0, 0, 0, 0.8);
                    "></div>
                </div>
            </div>
        `;

        return `
            <div id="scene-buttons" style="
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: auto;
            ">
                ${commonButtons}
                ${isOwner ? ownerButtons : ''}
            </div>
        `;
    }
}

export default ButtonsPrivateSceneHtml;
