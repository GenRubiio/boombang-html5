
import InputModalRepeatableController from './InputModalRepeatableController.js';
import InputModalDependencesController from './InputModalDependencesController.js';
import UtilsController from './UtilsController.js';
import Attr from './Attr.js';

const InputModalUpdateController = {
    trans: Attr.trans,
    attr: {
        modalInput: {
            el: '#modalInput',
            label: '#modalInputLabel',
            submitButton: '#creat-input-form_submit-button',
            buttonChangeLang: '#modal-change-lang_unput_modal',
            langOptions: '#modal-change-lang_unput_modal',
        },
        modalLangOptionButton: '.language_input_modal-option_button',
        modalLangOption: '#modal-change-lang_unput_modal',
        defaultLangLabel: '.current-language_input_modal',
        modal: {
            inputs: {
                label: 'input[name="creat-input-form_label"]',
                placeholder: 'input[name="creat-input-form_placeholder"]',
                show_label: 'input[name="creat-input-form_show_label"]',
                name: 'input[name="creat-input-form_name"]',
                type: '#select-input-type-custom-form',
                required: 'input[name="creat-input-form_required"]',
                show_in_preview: 'input[name="creat-input-form_show_in_preview"]',
                update_in_preview: 'input[name="creat-input-form_update_in_preview"]',
                show_in_email: 'input[name="creat-input-form_show_in_email"]',
            },
            selectOptionsContainer: '#select-options',
        }
    },
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('click', this.attr.modalLangOptionButton, (ev) => this.setLangOptionButtonHandler(ev));
    },
    setLangOptionButtonHandler(ev) {
        ev.preventDefault();

        let lang = $(ev.currentTarget).attr('data-local');
        let langName = $(ev.currentTarget).attr('data-lang-name');
        $(this.attr.defaultLangLabel).text(langName);
        $(this.attr.modalLangOption).attr('data-lang', lang);
        let item = JSON.parse($(this.attr.modalInput.el).attr('data-item'));
        this.setInputsForm(item, lang);
    },
    setInputsForm(inputObject, lang) {
        let label = UtilsController.getTranslation(lang, inputObject.input.label);
        let placeholder = UtilsController.getTranslation(lang, inputObject.input.placeholder);

        $(this.attr.modal.inputs.label).val(label);
        $(this.attr.modal.inputs.placeholder).val(placeholder);
        $(this.attr.modal.inputs.show_label).prop('checked', inputObject.input.show_label);
        $(this.attr.modal.inputs.name).val(inputObject.input.name);
        $(this.attr.modal.inputs.type).val(inputObject.input.type);
        $(this.attr.modal.inputs.required).prop('checked', inputObject.input.required ?? true);
        $(this.attr.modal.inputs.show_in_preview).prop('checked', inputObject.input.show_in_preview ?? true);
        $(this.attr.modal.inputs.update_in_preview).prop('checked', inputObject.input.update_in_preview ?? true);
        $(this.attr.modal.inputs.show_in_email).prop('checked', inputObject.input.show_in_email ?? true);

        window.newInputObject = inputObject.input;
        window.newInputObject.hash = inputObject.hash;

        InputModalRepeatableController.loadRepeatableItems();
        InputModalDependencesController.loadItems();

        let item = null;
        switch (inputObject.input.type) {
            case 'select':
                item = $(this.attr.modal.selectOptionsContainer);
                item.removeClass('d-none');
                break;
            case 'radio':
                item = $(this.attr.modal.selectOptionsContainer);
                item.removeClass('d-none');
                break;
            case 'checkbox':
                item = $(this.attr.modal.selectOptionsContainer);
                item.removeClass('d-none');
                break;
        }
    },
    openModalUpdateHandler(item) {
        let lang = $(this.attr.modalInput.langOptions).attr('data-lang');

        $(this.attr.modalInput.label).text(this.trans.update_input);
        $(this.attr.modalInput.submitButton).text(this.trans.save);
        $(this.attr.modalInput.submitButton).attr('data-hash-section', item.hash_section);
        $(this.attr.modalInput.submitButton).attr('data-hash-line', item.hash_line);
        $(this.attr.modalInput.submitButton).attr('data-order', item.order);
        $(this.attr.modalInput.submitButton).attr('data-method', 'update');
        $(this.attr.modalInput.el).attr('data-item', JSON.stringify(item));
        $(this.attr.modalInput.buttonChangeLang).removeClass('d-none');

        $(this.attr.modal.inputs.name).prop('disabled', true);
        $('.custom-form_prefix-entity-name').text('');

        this.setInputsForm(item, lang);

        $(this.attr.modalInput.el).modal('show');
    }
};

export default InputModalUpdateController;
