import Utils from '../helpers/UtilsHelper';

const CookiesController = {
    button: "#cookies-setting",
    init() {
        if (Utils.checkSection(this.button)) {
            this.setListeners();
        }
    },

    setListeners() {
        const button = document.querySelector(this.button);
        if (button) {
            button.addEventListener("click", () => {
                this.openModal();
            });
        }
    },

    openModal() {
        const modal = document.querySelector("#cookies-policy");
        if (window.LaravelCookieConsent && !modal) {
            window.LaravelCookieConsent.reset();
        }
    }
};

export default CookiesController;