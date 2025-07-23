import Attr from './Attr.js';

const UtilsController = {
    trans: Attr.trans,
    attr: {
        changeLangButton: '#modal-change-lang_unput_modal',
        changeLangSectionButton: '#modal-change-lang_section_modal',
        customFormInput: '#custom_form_data',
        customFormResultContainer: '#result_custom_form',
        customFormLoadingLabel: '.custom-form_loading-data',
        srfToken: document.querySelector('meta[name="csrf-token"]').content,
        blockCustomFormContainer: '.custom-form-section_block'
    },
    inputCustomFormValue() {
        try {
            return JSON.parse(JSON.parse($(this.attr.customFormInput).val()));
        } catch (e) {
            return JSON.parse($(this.attr.customFormInput).val());
        }
    },
    reloadCustomFormData(alert = false) {
        this.showLoadingLabel();
        this.resetWindowsObjects();
        $('input[type="button"]').prop('disabled', true);
        axios({
            method: "POST",
            url: $(this.attr.customFormInput).attr('data-route'),
            data: this.inputCustomFormValue(),
            headers: {
                "X-CSRF-TOKEN": this.attr.srfToken,
            }
        }).then(response => {
            this.hideLoadingLabel();
            if (alert) {
                this.savedAlert();
            }
            $('input[type="button"]').prop('disabled', false);
            $(this.attr.customFormResultContainer).html(response.data);
        }).catch(error => {
            this.hideLoadingLabel();
        });
    },
    showLoadingLabel() {
        $(this.attr.customFormLoadingLabel).removeClass('hidden').addClass('show');
        $(this.attr.blockCustomFormContainer).removeClass('d-none');
    },
    hideLoadingLabel() {
        $(this.attr.customFormLoadingLabel).removeClass('show').addClass('hidden');
        $(this.attr.blockCustomFormContainer).addClass('d-none');
    },
    showAlert(alert, text, show) {
        alert.text(text);
        if (show) {
            alert.removeClass('d-none');
        } else {
            alert.addClass('d-none');
        }
    },
    createSlug(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '_')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },
    creatHash() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },
    isNameExistInAnothersInputs(name) {
        let customFormJsonData = this.inputCustomFormValue();
        for (let i = 0; i < customFormJsonData.form_sections.length; i++) {
            let section = customFormJsonData.form_sections[i];
            for (let j = 0; j < section.lines.length; j++) {
                let line = section.lines[j];
                for (let k = 0; k < line.columns.length; k++) {
                    let column = line.columns[k];
                    if (column.input && column.input.name == name) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    getTranslation(lang, text) {
        if (text && text[lang]) {
            return text[lang];
        }
        return null;
    },
    resetWindowsObjects() {
        window.newInputObject = {
            label: '',
            placeholder: '',
            type: null,
            name: '',
            show_label: true,
            required: true,
            active: true,
            options: [],
            dependences: [],
            show_in_preview: true,
            update_in_preview: true,
            show_in_email: true
        };
        window.newLineObject = {
            hash_section: null,
            type: "line",
            admin_panel: {
                permission_update: true,
                permission_delete: true,
                permission_create: true
            },
            total_columns: 1,
            columns: []
        };;
        window.newSectionObject = {
            title: null,
            type: "section",
            admin_panel: {
                permission_update: true,
                permission_delete: true,
                permission_create: true
            },
            lines: [],
        };
    },
    inputModalLang() {
        return $(this.attr.changeLangButton).attr('data-lang');
    },
    sectionModalLang() {
        return $(this.attr.changeLangSectionButton).attr('data-lang');
    },
    defaultLang() {
        return $(this.attr.changeLangButton).attr('data-default-lang');
    },
    savedAlert() {
        new Noty({
            type: "success",
            text: this.trans.alert_changes_applied,
        }).show();
    },
    getPrefixEntityName() {
        let name = $(this.attr.customFormInput).attr('data-entity-name');
        return name.length > 0 ? name + '_' : '';
    }
};

export default UtilsController;
