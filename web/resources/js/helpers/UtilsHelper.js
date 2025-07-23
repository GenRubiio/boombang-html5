import RoutesHelper from './RoutesHelper';

const UtilsHelper = {
    modalTypes: {
        modalGeneric: {
            containerSelector: '#modal-container',
            contentSelector: '#modal-content'
        },
    },
    spinnerEl: {
        selector: '#spinner-loader',
        hideClass: 'show'
    },
    modalContentRenderEl: {
        selector: '.content-render'
    },

    toggleSpinner(show = false) {
        let spinner = document.querySelector(this.spinnerEl.selector);
        spinner.classList.toggle(this.spinnerEl.hideClass, show);
    },

    openModal(html = '', modalId = this.modalTypes.modalGeneric.containerSelector) {
        let modal = document.querySelector(modalId);
        modal.style.display = "block";
        this.toggleSpinner(true);
        document.querySelector(this.modalTypes.modalGeneric.contentSelector).innerHTML = html;
        document.querySelector('body').style.overflowY = 'hidden';
    },

    hideModal(modalId = this.modalTypes.modalGeneric.containerSelector) {
        let modal = document.querySelector(modalId);
        modal.style.display = "none";
        this.toggleSpinner(false);
        document.querySelector(this.modalTypes.modalGeneric.contentSelector).innerHTML = '';
        document.querySelector('body').style.overflowY = 'scroll';
    },

    checkIfModalTypesHasShowedModal() {
        for (const modalType in this.modalTypes) {
            const selector = this.modalTypes[modalType].selector;
            const isShowed = this.checkIfModalIsShowed(selector);
            if (isShowed) return true;
        }
        return false;
    },

    checkSection(selector) {
        return document.querySelectorAll(selector).length;
    },

    checkIfModalIsShowed(modalId) {
        return document.querySelector(modalId).classList.contains('show');
    },

    getUrl(route, hasSlug = false) {
        const routesHelper = new RoutesHelper();
        const slug = hasSlug ? this.getEventDetailConfig().slug : null;
        return routesHelper.getRoute(
            route,
            slug,
            '%slug%'
        );
    },

    getEventDetailConfig() {
        let e = window.app.page;
        if ('undefined' == typeof e)
            throw new Error('This config does not exists. EMC01');
        return e;
    },

    showModal(selector) {
        document.querySelector(selector).style.display = "block";
    },

    hiddenModal(selector) {
        document.querySelector(selector).style.display = "none";
    },

    disable(selector) {
        document.querySelector(selector).attr('disabled', true);
    },

    enable(selector) {
        document.querySelector(selector).attr('disabled', false);
    },

    getCurrentPage() {
        let main = document.querySelector('main');
        let firstElement = main.firstElementChild;
        return firstElement.id;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Copy makeRequest to the controller where you want to use it. Don't import from UtilsHelper! //
    //////////////////////////////////////////////////////////////////////////////////////////
    //
    // makeRequest(url, data, callbacksFn) {
    //   const $req = axios.post(url, data);
    //   $req.then((response) => {
    //     let sFn = callbacksFn.success;
    //
    //     if (typeof sFn == "function")
    //       sFn.bind(this)(response);
    //   });
    //
    //   $req.catch((response) => {
    //     let eFn = callbacksFn.error;
    //
    //     if (typeof eFn == "function")
    //       eFn.bind(this)(response);
    //   });
    // },
    ////////////////////////////////////////////////////////////////////////////////////////////
};
export default UtilsHelper;
