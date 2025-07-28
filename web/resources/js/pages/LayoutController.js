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
                window.open(
                    link.href,
                    'popupWindow',
                    'width=1012,height=657,left=100,top=100,resizable=yes,scrollbars=yes'
                );
            });
        });
    },
};

export default LayoutController;
