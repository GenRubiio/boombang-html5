import Utils from '../helpers/UtilsHelper';

const ScrollDownController = {
    pageScrollDownEl: {
        selector: '.scroll-down-js'
    },

    init() {
        if (Utils.checkSection(this.pageScrollDownEl.selector)) {
            this.setListeners();
        }
    },

    setListeners() {
        document
            .querySelector(this.pageScrollDownEl.selector)
            .addEventListener("click", ev => this.scrollDownHandle(ev));
    },

    scrollDownHandle(ev) {
        const targetElement = ev.target;
        const currentTargetElement = ev.currentTarget;
        if (targetElement.closest('[data-hover-cursor="false"]')) {
            return;
        }
        const scrollToId = currentTargetElement.getAttribute('data-scroll-to');
        const textSection = document.getElementById(scrollToId);
        if (!textSection) {
            return;
        }
        textSection.scrollIntoView({behavior: 'smooth'});
    },
};

export default ScrollDownController;
