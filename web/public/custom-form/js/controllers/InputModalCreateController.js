import InputModalController from './InputModalController.js';
import InputModalValidationsController from './InputModalValidationsController.js';
import UtilsController from './UtilsController.js';

const InputModalCreateController = {
    attr: {
        inputModal: '#modalInput',
        saveButton: '#creat-input-form_submit-button',
        inputCustomForm: '#custom_form_data',
    },
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('click', this.attr.saveButton, (ev) => this.saveFormHandler(ev));
    },
    saveFormHandler(ev) {
        let button = $(ev.currentTarget);
        let method = button.attr('data-method');
        $(this.attr.inputModal).animate({
            scrollTop: 0
        }, 500);
        window.newInputObject.options = window.newInputObject.options.filter(option => option.value != '');
        window.newInputObject.dependences = window.newInputObject.dependences.filter(dependence => dependence.input_hash != null);

        if (method == "create" && !InputModalValidationsController.createMethodValidations()) {
            return;
        }
        if (method == "update" && !InputModalValidationsController.updateMethodValidations()) {
            return;
        }

        if (method == "update") {
            this.validateOptions();
        }


        let customFormJsonData = UtilsController.inputCustomFormValue();
        let hashSection = button.attr('data-hash-section');
        let hashLine = button.attr('data-hash-line');
        let order = button.attr('data-order');

        let section = customFormJsonData.form_sections.find(section => section.hash ==
            hashSection);
        let line = section.lines.find(line => line.hash == hashLine);
        let column = line.columns.find(column => column.order == order);

        let newInput = {
            column_hash: column.hash,
            label: window.newInputObject.label,
            placeholder: window.newInputObject.placeholder,
            type: window.newInputObject.type,
            name: UtilsController.createSlug(window.newInputObject.name),
            show_label: window.newInputObject.show_label,
            required: window.newInputObject.required,
            active: window.newInputObject.active,
            dependences: [],
            options: window.newInputObject.options,
            dependences: window.newInputObject.dependences,
            show_in_preview: window.newInputObject.show_in_preview ?? true,
            update_in_preview: window.newInputObject.update_in_preview ?? true,
            show_in_email: window.newInputObject.show_in_email ?? true
        }
        console.log(newInput);
        column.input = newInput;

        let form = button.closest('form');
        InputModalController.resetFormInputValues(form);
        button.closest('.modal').modal('hide');
        document.body.style.overflow = 'scroll';
        $('#custom_form_data').val(JSON.stringify(customFormJsonData));
        UtilsController.savedAlert();
        UtilsController.reloadCustomFormData();
    },
    validateOptions() {
        let defaultLang = UtilsController.defaultLang();
        window.newInputObject.options.forEach((option, index) => {
            if (!option.value[defaultLang]) {
                option.value[defaultLang] = option.value[UtilsController.inputModalLang()];
            }
        });
    }
};

export default InputModalCreateController;
