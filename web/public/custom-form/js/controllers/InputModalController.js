
import UtilsController from './UtilsController.js';
import InputModalRepeatableController from './InputModalRepeatableController.js';
import Attr from './Attr.js';

const InputModalController = {
    trans: Attr.trans,
    attr: {
        modalInput: '#modalInput',
        modalOpenButton: '.input-container button[data-target="#modalInput"]',
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
        formInput: {
            selectOptions: '#select-options',
        },
        alert: ".alert-creat-input-form"
    },
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('click', this.attr.modalOpenButton, (ev) => this.openModalCreateHandler(ev));
        $(document).on('hidden.bs.modal', this.attr.modalInput, (ev) => this.closeModalHandler(ev));
        $(document).on('change', this.attr.inputs.show_label, (ev) => this.setShowLabelInputHandler(ev));
        $(document).on('keyup', this.attr.inputs.label, (ev) => this.setLabelInputHandler(ev));
        $(document).on('keyup', this.attr.inputs.placeholder, (ev) => this.setPlaceholderInputHandler(ev));
        $(document).on('keyup', this.attr.inputs.name, (ev) => this.setNameInputHandler(ev));
        $(document).on('change', this.attr.inputs.type, (ev) => this.setTypeInputHandler(ev));
        $(document).on('change', this.attr.inputs.required, (ev) => this.setRequiredInputHandler(ev));
        $(document).on('change', this.attr.inputs.show_in_preview, (ev) => this.setShowInPreviewInputHandler(ev));
        $(document).on('change', this.attr.inputs.update_in_preview, (ev) => this.setUpdateInPreviewInputHandler(ev));
        $(document).on('change', this.attr.inputs.show_in_email, (ev) => this.setShowInEmailInputHandler(ev));
    },
    openModalCreateHandler(ev) {
        $('#modalInputLabel').text(this.trans.create_input);
        $('#creat-input-form_submit-button').text(this.trans.create);
        let hashSection = $(ev.currentTarget).attr('data-hash-section');
        let hashLine = $(ev.currentTarget).attr('data-hash-line');
        let order = $(ev.currentTarget).attr('data-order');

        $('#creat-input-form_submit-button').attr('data-hash-section', hashSection);
        $('#creat-input-form_submit-button').attr('data-hash-line', hashLine);
        $('#creat-input-form_submit-button').attr('data-order', order);
        $('#creat-input-form_submit-button').attr('data-method', 'create');
        $('.custom-form_prefix-entity-name').text(UtilsController.getPrefixEntityName());
    },
    closeModalHandler(ev) {
        //let form = $(this.attr.modalInput).find('form');
        //this.resetFormInputValues(form);
        UtilsController.reloadCustomFormData();
    },
    setShowLabelInputHandler(ev) {
        window.newInputObject.show_label = $(ev.currentTarget).prop('checked');
    },
    setRequiredInputHandler(ev) {
        window.newInputObject.required = $(ev.currentTarget).prop('checked');
    },
    setShowInPreviewInputHandler(ev) {
        window.newInputObject.show_in_preview = $(ev.currentTarget).prop('checked');
    },
    setUpdateInPreviewInputHandler(ev) {
        window.newInputObject.update_in_preview = $(ev.currentTarget).prop('checked');
    },
    setShowInEmailInputHandler(ev) {
        window.newInputObject.show_in_email = $(ev.currentTarget).prop('checked');
    },
    setLabelInputHandler(ev) {
        let lang = UtilsController.inputModalLang();
        if (!window.newInputObject.label) {
            window.newInputObject.label = {};
        }
        window.newInputObject.label[lang] = $(ev.currentTarget).val();
        let method = $('#creat-input-form_submit-button').attr('data-method');
        if (method == "create") {
            let prefix = UtilsController.getPrefixEntityName();
            let slug = UtilsController.createSlug($(ev.currentTarget).val());
            window.newInputObject.name = prefix + slug;
            $(this.attr.inputs.name).val(slug);
        }
    },
    setPlaceholderInputHandler(ev) {
        let lang = UtilsController.inputModalLang();
        if (!window.newInputObject.placeholder) {
            window.newInputObject.placeholder = {};
        }
        window.newInputObject.placeholder[lang] = $(ev.currentTarget).val();
    },
    setNameInputHandler(ev) {
        let prefix = UtilsController.getPrefixEntityName();
        window.newInputObject.name = prefix + $(ev.currentTarget).val();
    },
    setTypeInputHandler(ev) {
        window.newInputObject.type = $(ev.currentTarget).val();

        let container = $(this.attr.formInput.selectOptions);
        switch ($(ev.currentTarget).val()) {
            case 'select':
                container.removeClass('d-none');
                break;
            case 'radio':
                container.removeClass('d-none');
                break;
            case 'checkbox':
                container.removeClass('d-none');
                break;
            default:
                container.addClass('d-none');
                InputModalRepeatableController.removeSelectOptions();
                break;
        }
    },
    resetFormInputValues(form) {
        let alert = $(this.attr.alert);
        UtilsController.showAlert(alert, '', false);
        window.newInputObject = window.cloneNewInputObject;
        form[0].reset();
        InputModalRepeatableController.removeSelectOptions();
        let container = $(this.attr.formInput.selectOptions);
        container.addClass('d-none');
    }
};

export default InputModalController;
