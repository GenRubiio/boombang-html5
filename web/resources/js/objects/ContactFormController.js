import Utils from '../helpers/UtilsHelper';

const ContactFormController = {
    pageEl: {
        formSelector: '#contact-form',
    },

    attr: {
        csrf_token: document.querySelector('meta[name="csrf-token"]').content,
    },

    init() {
        this.setListeners();
    },

    setListeners() {
        if (Utils.checkSection(this.pageEl.formSelector)) {
            let form = document.querySelector(this.pageEl.formSelector);
            if (form) {
                form.addEventListener("submit", ev => this.submitFormHandler(ev));
            }
        }
    },

    submitFormHandler(ev) {
        ev.preventDefault();
        const form = ev.target;
        const data = new FormData(form);
        const url = form.getAttribute("action");
        const method = form.getAttribute("method");
        const formName = form.getAttribute("id");
        const headers = {
            "X-CSRF-TOKEN": this.attr.csrf_token
        };
        const dataObject = this.getDataForm(data);
        this.disableSubmitButton(form, true);
        this.removeAllErrors(dataObject, formName);
        this.removeSuccessMessage(dataObject, formName);
        this.sendAxios(method, url, dataObject, headers, form);
    },

    sendAxios(method, url, dataObject, headers, form) {
        axios({
            method: method,
            url: url,
            data: dataObject,
            headers: headers
        }).then(response => {
            if (response.data.success) {
                form.reset();
                this.successGeneric(response.data, form.getAttribute("id"));
            } else {
                this.errorsGeneric(response.data);
            }
            this.disableSubmitButton(form, false);
        }).catch(error => {
            this.errorsRequestManager(error, form.getAttribute("id"));
            this.disableSubmitButton(form, false);
        });
    },

    successGeneric(data, formName) {
        const message = data.message;
        // console.log(message);
        let span = document.querySelector(`#${formName}_success`);
        if (span) {
            span.innerHTML = message;
        }
    },

    errorsGeneric(data) {
        console.log(data);
    },

    disableSubmitButton(form, active) {
        let submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = active;
        Utils.toggleSpinner(active);
    },

    removeSuccessMessage(dataObject, formName) {
        let span = document.querySelector(`#${formName}_success`);
        if (span) {
            span.textContent = '';
        }
    },

    removeAllErrors(dataObject, formName) {
        for (const field in dataObject) {
            let span = document.querySelector(`#${formName}_error_input_${field}:not(.hidden)`);
            if (span) {
                span.textContent = '';
            }
        }
    },

    errorsRequestManager(error, formName) {
        if (error.response.status === 422) {
            const errors = error.response.data.errors;
            for (const field in errors) {
                let span = document.querySelector(`#${formName}_error_input_${field}:not(.hidden)`);
                if (span) {
                    span.textContent = errors[field][0];
                }
            }
        } else {
            //console.log('Error en la solicitud:', error.message);
        }
    },

    getDataForm(data) {
        const dataObject = {};
        data.forEach((value, key) => {
            if (dataObject[key]) {
                if (!Array.isArray(dataObject[key])) {
                    dataObject[key] = [dataObject[key]];
                }
                dataObject[key].push(value);
            } else {
                dataObject[key] = value;
            }
        });
        return dataObject;
    },
};

export default ContactFormController;
