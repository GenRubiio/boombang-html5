import i18n from "@/plugins/i18n";

class ButtonsPublicSceneHtml {
    static load() {
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
                    <img src="src/assets/game/scene/ui/shop.webp" style="max-width: 37px;">
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
                    <img src="src/assets/game/scene/ui/avatars.webp" style="max-width: 37px;">
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
            </div>
        `;
    }
}

export default ButtonsPublicSceneHtml;
