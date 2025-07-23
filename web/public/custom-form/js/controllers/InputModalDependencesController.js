
import UtilsController from './UtilsController.js';

const InputModalDependencesController = {
    attr: {
        addButton: '#custom-form-dependences-container_button_create',
        removeButton: '.custom-form-dependence-form_controls-button',
        inputsSelect: '.custom-form_dependences_select-inputs',
        inputsOptionsSelect: '.custom-form_dependences_select-input_options',
    },
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('click', this.attr.addButton, (ev) => this.addButtonHandler(ev));
        $(document).on('click', this.attr.removeButton, (ev) => this.removeButtonHandler(ev));
        $(document).on('change', this.attr.inputsSelect, (ev) => this.inputsSelectHandler(ev));
        $(document).on('change', this.attr.inputsOptionsSelect, (ev) => this.inputsOptionsSelectHandler(ev));
    },
    inputsSelectHandler(ev) {
        let dependenceHash = $(ev.currentTarget).find(':selected').data('dependence-hash');
        let inputHash = $(ev.currentTarget).val();
        window.newInputObject.dependences.forEach(function (dependence) {
            if (dependence.hash == dependenceHash) {
                dependence.input_hash = inputHash;
            }
        });
        this.loadItems();
    },
    inputsOptionsSelectHandler(ev) {
        let dependenceHash = $(ev.currentTarget).find(':selected').data('dependence-hash');
        let inputOptionHash = $(ev.currentTarget).val();
        window.newInputObject.dependences.forEach(function (dependence) {
            if (dependence.hash == dependenceHash) {
                dependence.input_option_hash = inputOptionHash;
            }
        });
    },
    removeButtonHandler(ev) {
        ev.preventDefault();
        let dependenceHash = $(ev.currentTarget).attr('data-dependence-hash');
        window.newInputObject.dependences = window.newInputObject.dependences.filter(dependence => dependence.hash != dependenceHash);
        this.loadItems();
    },
    addButtonHandler(ev) {
        ev.preventDefault();
        window.newInputObject.dependences.push({
            hash: UtilsController.creatHash(),
            input_hash: null,
            input_option_hash: null
        });
        this.loadItems();
    },
    loadItems() {
        this.removeOptions();
        let lang = UtilsController.defaultLang();
        let customFormJsonData = UtilsController.inputCustomFormValue();
        let columns = this.getColumnsInputByTypes(customFormJsonData, ['select', 'radio', 'checkbox']);
        let attributes = this.attr;

        for (let i = 0; i < window.newInputObject.dependences.length; i++) {
            let dependenceHash = window.newInputObject.dependences[i].hash;
            let item = $('.custom-form-dependence-input.d-none').clone();
            item.attr('data-hash', dependenceHash);
            item.removeClass('d-none');
            let removeButton = item.find(attributes.removeButton);
            removeButton.attr('data-dependence-hash', dependenceHash);

            let selectInput = item.find(attributes.inputsSelect);
            columns.forEach(function (column) {
                let inputText = UtilsController.getTranslation(lang, column.input.label);
                let inputOption = new Option(inputText + ": " + column.input.name, column.hash);
                $(inputOption).attr('data-options', JSON.stringify(column.input.options));
                $(inputOption).attr('data-dependence-hash', dependenceHash);
                selectInput.append(inputOption);

                if (window.newInputObject.dependences[i].input_hash == column.hash) {
                    inputOption.selected = true;

                    let selectInputOptions = item.find(attributes.inputsOptionsSelect);
                    for (let j = 0; j < column.input.options.length; j++) {
                        let optionItem = column.input.options[j];
                        let optionText = UtilsController.getTranslation(lang, optionItem.value);
                        let valueOption = new Option(optionText, optionItem.hash);
                        $(valueOption).attr('data-dependence-hash', dependenceHash);
                        selectInputOptions.append(valueOption);
                        if (window.newInputObject.dependences[i].input_option_hash == optionItem.hash) {
                            valueOption.selected = true;
                        }
                    }
                    if (window.newInputObject.dependences[i].input_option_hash == null) {
                        window.newInputObject.dependences[i].input_option_hash = column.input.options[0].hash ?? null;
                    }
                }
            });

            if (window.newInputObject.dependences[i].input_hash == null) {
                item.find(this.attr.inputsOptionsSelect).attr('disabled', true);
            }

            let container = $('.custom-form-dependences-container');
            if (i > 0) {
                container.find('.custom-form-dependence-input:not(.d-none)').last().after(item);
            } else {
                container.prepend(item);
            }
        }
    },
    removeOptions() {
        $('.custom-form-dependences-container').find('.custom-form-dependence-input:not(.d-none)').not(
            '#custom-form-dependences-container_button_create').remove();
    },
    getColumnsInputByTypes(customFormJsonData, types) {
        let columns = [];
        for (let i = 0; i < customFormJsonData.form_sections.length; i++) {
            let section = customFormJsonData.form_sections[i];
            for (let j = 0; j < section.lines.length; j++) {
                let line = section.lines[j];
                for (let k = 0; k < line.columns.length; k++) {
                    let column = line.columns[k];
                    if (column.input && types.includes(column.input.type)) {
                        columns.push(column);
                    }
                }
            }
        }
        return columns;
    }
};

export default InputModalDependencesController;
