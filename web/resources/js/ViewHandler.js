import BrowserUpdateController from './objects/BrowserUpdateController';
import LayoutController from './objects/LayoutController';
import NavbarController from './objects/NavbarController';
import ScrollToTopController from './objects/ScrollToTopController';
import SlidersController from './objects/SlidersController';
import SearcherController from './objects/SearcherController';
import ContactFormController from './objects/ContactFormController';
import ScrollDownController from './objects/ScrollDownController';
import CookiesController from './objects/CookiesController';
import HomePageController from './pages/HomePageController';

const ViewHandler = {
    init(data) {
        document.addEventListener('DOMContentLoaded', () => {
            this.onDocumentReady();
        });
    },

    onDocumentReady() {
        this.initControllers();
    },

    initControllers() {
        BrowserUpdateController.init();
        LayoutController.init();
        NavbarController.init();
        ScrollToTopController.init();
        SlidersController.init();
        SearcherController.init();
        ContactFormController.init();
        ScrollDownController.init();
        CookiesController.init();
        HomePageController.init();
    },
};

export default ViewHandler;
