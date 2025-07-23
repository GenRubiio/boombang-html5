
import UtilsController from './UtilsController.js';

const InputModalRepeatableController = {
    attr: {
        repeatable: {
            container: '.repeatable_select-inputs-container',
            items: '.repeatable_select-input:not(.d-none)',
            inputs: {
                default: '.repeatable_select-inputs-container input[name="default"]',
                value: '.repeatable_select-inputs-container input[name="value"]',
            },
            controlButton: '.repeatable_select-form_controls-button',
            createButton: '#repeatable_select-inputs-button_create'
        },
    },
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('keyup', this.attr.repeatable.inputs.value, (ev) => this.setRepeatableValueInputHandler(ev));
        $(document).on('change', this.attr.repeatable.inputs.default, (ev) => this.setRepeatableDefaultInputHandler(ev));
        $(document).on('click', this.attr.repeatable.controlButton, (ev) => this.repeatableItemActionHandler(ev));
        $(document).on('click', this.attr.repeatable.createButton, (ev) => this.repeatableCreateHandler(ev));
    },
    repeatableCreateHandler(ev) {
        ev.preventDefault();
        window.newInputObject.options.push({
            hash: UtilsController.creatHash(),
            order: window.newInputObject.options.length + 1,
            value: '',
            default: false
        });
        this.loadRepeatableItems();
    },
    repeatableItemActionHandler(ev) {
        ev.preventDefault();
        let action = $(ev.currentTarget).attr('data-action');
        let item = $(ev.currentTarget).closest('.repeatable_select-input');
        let order = item.attr('data-order');
        switch (action) {
            case 'delete':
                window.newInputObject.options.splice(order - 1, 1);
                this.loadRepeatableItems();
                break;
            case 'up':
                let itemUp = window.newInputObject.options.splice(order - 1, 1);
                window.newInputObject.options.splice(order - 2, 0, itemUp[0]);
                this.loadRepeatableItems();
                break;
            case 'down':
                let itemDown = window.newInputObject.options.splice(order - 1, 1);
                window.newInputObject.options.splice(order, 0, itemDown[0]);
                this.loadRepeatableItems();
                break;
            default:
                break;
        }
    },
    setRepeatableDefaultInputHandler(ev) {
        let order = $(ev.currentTarget).closest('.repeatable_select-input').attr('data-order');
        if ($(ev.currentTarget).prop('checked')) {
            for (let i = 0; i < window.newInputObject.options.length; i++) {
                if (i != order - 1) {
                    window.newInputObject.options[i].default = false;
                }
            }
        }
        window.newInputObject.options[order - 1].default = $(ev.currentTarget).prop('checked');
        this.loadRepeatableItems();
    },
    setRepeatableValueInputHandler(ev) {
        let lang = UtilsController.inputModalLang();
        let order = $(ev.currentTarget).closest('.repeatable_select-input').attr('data-order');

        if (!window.newInputObject.options[order - 1].value) {
            window.newInputObject.options[order - 1].value = {};
        }
        window.newInputObject.options[order - 1].value[lang] = $(ev.currentTarget).val();
    },
    loadRepeatableItems() {
        let lang = UtilsController.inputModalLang();
        for (let i = 0; i < window.newInputObject.options.length; i++) {
            window.newInputObject.options[i].order = i + 1;
        }

        this.removeSelectOptions();

        for (let i = 0; i < window.newInputObject.options.length; i++) {
            let item = $('.repeatable_select-input.d-none').clone();
            item.attr('data-order', window.newInputObject.options[i].order);
            item.attr('data-hash', window.newInputObject.options[i].hash);
            item.removeClass('d-none');
            item.find('input[name="value"]').val(UtilsController.getTranslation(lang, window.newInputObject.options[i].value));
            if (window.newInputObject.options[i].default) {
                item.find('input[name="default"]').prop('checked', true);
            }
            if (i == 0) {
                item.find('.repeatable_select-form_controls-button[data-action="up"]').addClass(
                    'd-none');
            } else if (i == window.newInputObject.options.length - 1) {
                item.find('.repeatable_select-form_controls-button[data-action="down"]').addClass(
                    'd-none');
            }
            if (i == 0 && window.newInputObject.options.length == 1) {
                item.find('.repeatable_select-form_controls-button[data-action="down"]').addClass(
                    'd-none');
            }
            let container = $('.repeatable_select-inputs-container');
            if (i > 0) {
                container.find('.repeatable_select-input:not(.d-none)').last().after(item);
            } else {
                container.prepend(item);
            }
        }
    },
    removeSelectOptions() {
        $(this.attr.repeatable.container).find(this.attr.repeatable.items).not(
            this.attr.repeatable.createButton).remove();
    },
};

export default InputModalRepeatableController;
