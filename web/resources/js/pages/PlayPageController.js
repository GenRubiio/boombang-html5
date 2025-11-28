import Utils from "../helpers/UtilsHelper.js";

const PlayPageController = {
    attr: {
        page: '#page-play',
    },

    init() {
        if (Utils.checkSection(this.attr.page)) {
            this.removeHeader();
            this.setListeners();
            // Esperar un poco para que el iframe esté en el DOM
            setTimeout(() => this.rescaleIframe(), 100);
        }
    },

    setListeners() {
        window.addEventListener('resize', () => this.rescaleIframe());
    },

    rescaleIframe() {
        const baseWidth = 1012;
        const baseHeight = 657;

        const scaleX = window.innerWidth / baseWidth;
        const scaleY = window.innerHeight / baseHeight;

        // Usa el menor para que siempre quepa sin salirse, máximo 1 (tamaño original)
        const scale = Math.min(scaleX, scaleY, 1);

        const iframe = document.querySelector(`${this.attr.page} iframe`);
        if (iframe) {
            iframe.style.transform = `scale(${scale})`;
            console.log(`[PlayPage] Iframe scaled to: ${scale.toFixed(2)} (window: ${window.innerWidth}x${window.innerHeight})`);
        } else {
            console.warn('[PlayPage] Iframe not found');
        }
    },

    removeHeader() {
        const header = document.querySelector('header');
        if (header) {
            header.remove();
        }
        const footer = document.querySelector('footer');
        if (footer) {
            footer.remove();
        }
    }
};

export default PlayPageController;
