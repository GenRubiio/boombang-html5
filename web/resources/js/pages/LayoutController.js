import Utils from "../helpers/UtilsHelper.js";

const LayoutController = {
    init() {
        this.setListeners();
    },

    setListeners() {
        const links = document.querySelectorAll(`a.open-popup`);
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAdaptiveWindow(link.href);
            });
        });
    },

    openAdaptiveWindow(url) {
        const baseWidth = 1012;
        const baseHeight = 657;

        // Obtener el tamaño real disponible de la pantalla (respeta el zoom del usuario)
        const screenW = window.screen.availWidth;
        const screenH = window.screen.availHeight;

        // Calcular escala para que la ventana nunca sea más grande que la pantalla
        const scale = Math.min(screenW / baseWidth, screenH / baseHeight, 1);

        // Aplicar escala al tamaño de la ventana
        const finalW = Math.floor(baseWidth * scale);
        const finalH = Math.floor(baseHeight * scale);

        // Centrar la ventana en la pantalla
        const left = Math.floor((screenW - finalW) / 2);
        const top = Math.floor((screenH - finalH) / 2);

        window.open(
            url,
            'popupWindow',
            `width=${finalW},height=${finalH},left=${left},top=${top},resizable=yes,scrollbars=no`
        );
    },
};

export default LayoutController;
