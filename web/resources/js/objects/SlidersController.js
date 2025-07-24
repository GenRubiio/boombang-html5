// import Swiper JS: https://swiperjs.com/swiper-api
import Swiper from 'swiper';
import {EffectFade, Navigation, Pagination} from 'swiper/modules';

const SlidersController = {
    swiperSliderEl: {
        selector: '.swiper',
        paginationEl: '.swiper-pagination',
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
        scrollbarEl: '.swiper-scrollbar',
    },

    init() {
        this.setListeners();
        this.initSliders();
    },

    setListeners() {

    },

    initSliders() {
        this.initHeaderSlider();
    },

    initHeaderSlider() {
        this.headerSwiper = new Swiper(this.swiperSliderEl.selector, {
            modules: [Navigation, Pagination, EffectFade],
            // Optional parameters
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: true,
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            speed: 1000,
            // If we need pagination
            pagination: {
                el: this.swiperSliderEl.paginationEl,
                clickable: true
                // type: "bullets"
            },

            // Navigation arrows
            navigation: {
                nextEl: this.swiperSliderEl.nextEl,
                prevEl: this.swiperSliderEl.prevEl,
            },

            // And if we need scrollbar
            scrollbar: {
                el: this.swiperSliderEl.scrollbarEl,
            },
        });
    },
};
export default SlidersController;
