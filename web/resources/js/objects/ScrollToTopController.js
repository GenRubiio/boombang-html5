import Utils from '../helpers/UtilsHelper';

const ScrollToTop = {
    pageScrollToTopEl: {
        selector: '.page-scroll-to-top-js',
        visibleClass: 'visible',
    },

    init() {
        this.setListeners();
        this.initShowPageScrollToTop();
    },

    setListeners() {
        if (Utils.checkSection(this.pageScrollToTopEl.selector)) {
            document
                .querySelector(this.pageScrollToTopEl.selector)
                .addEventListener("click", ev => this.initPageScrollToTop(ev));
        }
    },

    initShowPageScrollToTop() {
        const element = document.querySelector(this.pageScrollToTopEl.selector);

        window.addEventListener('scroll', () => this.handleShowPageScrollToTop(element));

        this.handleShowPageScrollToTop(element);
    },

    handleShowPageScrollToTop(element) {
        const windowHeight = window.innerHeight * 2;

        if (window.scrollY > windowHeight) {
            element.classList.add(this.pageScrollToTopEl.visibleClass);
        } else {
            element.classList.remove(this.pageScrollToTopEl.visibleClass);
        }
    },

    initPageScrollToTop() {
        console.log('init stt');
        const distanceScrolled = window.scrollY;

        window.scrollBy({
            top: -distanceScrolled,
            behavior: 'smooth'
        });
    },
};

export default ScrollToTop;
