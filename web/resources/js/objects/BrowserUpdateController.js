import browserUpdate from 'browser-update';
//https://browser-update.org/customize.html

const BrowserUpdateController = {
    init() {
        this.initBrowserUpdate();
    },

    setListeners() {

    },

    initBrowserUpdate() {
        browserUpdate({
            required: {
                e: 100,
                f: 100,
                o: 84,
                s: 12,
                c: 100,
            },
            insecure: true,
            style: "corner",
            reminder: 24,// after how many hours should the message reappear
            reminderClosed: 72,// if the user explicitly closes message it reappears after x hours
        });
    },
};

export default BrowserUpdateController;
