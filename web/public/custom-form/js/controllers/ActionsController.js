import UtilsController from './UtilsController.js';
import InputModalUpdateController from './InputModalUpdateController.js';
import LineModalUpdateController from './LineModalUpdateController.js';
import SectionModalUpdateController from './SectionModalUpdateController.js';
import Attr from './Attr.js';

const ActionsController = {
    trans: Attr.trans,
    attr: {
        controlButton: '.custom-form_controls-button',
        customFormInput: '#custom_form_data',
    },
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('click', this.attr.controlButton, (ev) => this.controlButtonHandler(ev));
    },
    controlButtonHandler(ev) {
        let actionButton = ev.currentTarget;
        let action = actionButton.getAttribute('data-action');
        let item = JSON.parse(actionButton.getAttribute('data-item'));

        switch (action) {
            case 'update':
                this.updateItem(item);
                break;
            case 'right':
                this.rightItem(item);
                break;
            case 'left':
                this.leftItem(item);
                break;
            case 'up':
                this.upItem(item);
                break;
            case 'down':
                this.downItem(item);
                break;
            case 'delete':
                this.deleteItem(item);
                break;
            default:
                break;
        }
    },
    updateItem(item) {
        switch (item.type) {
            case 'column':
                InputModalUpdateController.openModalUpdateHandler(item);
                break;
            case 'line':
                LineModalUpdateController.openModalUpdateHandler(item);
                break;
            case 'section':
                SectionModalUpdateController.openModalUpdateHandler(item);
                break;
        }
    },
    deleteItem(item) {
        swal({
            title: this.trans.swal.title,
            text: this.trans.swal.text,
            icon: "warning",
            buttons: [this.trans.swal.cancel, this.trans.swal.delete],
            dangerMode: true,
        }).then((value) => {
            if (value) {
                let customFormJsonData = UtilsController.inputCustomFormValue();
                switch (item.type) {
                    case 'column':
                        let section = customFormJsonData.form_sections.find(section => section.hash == item.hash_section);
                        let line = section.lines.find(line => line.hash == item.hash_line);
                        let column = line.columns.find(column => column.hash == item.hash);
                        if (column.input) {
                            column.input = null;
                        }
                        $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
                        UtilsController.reloadCustomFormData(true);
                        break;
                    case 'line':
                        let sectionLine = customFormJsonData.form_sections.find(section => section
                            .hash == item.hash_section);
                        sectionLine.lines.splice(item.order - 1, 1);
                        for (let i = 0; i < sectionLine.lines.length; i++) {
                            sectionLine.lines[i].order = i + 1;
                        }
                        $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
                        UtilsController.reloadCustomFormData(true);
                        break;
                    case 'section':
                        customFormJsonData.form_sections.splice(item.order - 1, 1);
                        for (let i = 0; i < customFormJsonData.form_sections.length; i++) {
                            customFormJsonData.form_sections[i].order = i + 1;
                        }
                        $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
                        UtilsController.reloadCustomFormData(true);
                        break;
                }
            }
        });
    },
    rightItem(item) {
        let customFormJsonData = UtilsController.inputCustomFormValue();
        switch (item.type) {
            case 'column':
                let section = customFormJsonData.form_sections.find(section => section.hash == item.hash_section);
                let line = section.lines.find(line => line.hash == item.hash_line);
                let column = line.columns.splice(item.order - 1, 1);
                line.columns.splice(item.order, 0, column[0]);
                for (let i = 0; i < line.columns.length; i++) {
                    line.columns[i].order = i + 1;
                }
                $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
                UtilsController.reloadCustomFormData(true);
                break;
        }
    },
    leftItem(item) {
        let customFormJsonData = UtilsController.inputCustomFormValue();
        switch (item.type) {
            case 'column':
                let section = customFormJsonData.form_sections.find(section => section.hash == item.hash_section);
                let line = section.lines.find(line => line.hash == item.hash_line);
                let column = line.columns.splice(item.order - 1, 1);
                line.columns.splice(item.order - 2, 0, column[0]);
                for (let i = 0; i < line.columns.length; i++) {
                    line.columns[i].order = i + 1;
                }
                $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
                UtilsController.reloadCustomFormData(true);
                break;
        }
    },
    upItem(item) {
        let customFormJsonData = UtilsController.inputCustomFormValue();
        switch (item.type) {
            case 'line':
                let section = customFormJsonData.form_sections.find(section => section.hash == item.hash_section);
                let line = section.lines.splice(item.order - 1, 1);
                section.lines.splice(item.order - 2, 0, line[0]);
                for (let i = 0; i < section.lines.length; i++) {
                    section.lines[i].order = i + 1;
                }
                $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
                UtilsController.reloadCustomFormData(true);
                break;
            case 'section':
                let sectionUp = customFormJsonData.form_sections.splice(item.order - 1, 1);
                customFormJsonData.form_sections.splice(item.order - 2, 0, sectionUp[0]);
                for (let i = 0; i < customFormJsonData.form_sections.length; i++) {
                    customFormJsonData.form_sections[i].order = i + 1;
                }
                $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
                UtilsController.reloadCustomFormData(true);
                break;
        }
    },
    downItem(item) {
        let customFormJsonData = UtilsController.inputCustomFormValue();
        switch (item.type) {
            case 'line':
                let section = customFormJsonData.form_sections.find(section => section.hash == item.hash_section);
                let line = section.lines.splice(item.order - 1, 1);
                section.lines.splice(item.order, 0, line[0]);
                for (let i = 0; i < section.lines.length; i++) {
                    section.lines[i].order = i + 1;
                }
                $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
                UtilsController.reloadCustomFormData(true);
                break;
            case 'section':
                let sectionDown = customFormJsonData.form_sections.splice(item.order - 1, 1);
                customFormJsonData.form_sections.splice(item.order, 0, sectionDown[0]);
                for (let i = 0; i < customFormJsonData.form_sections.length; i++) {
                    customFormJsonData.form_sections[i].order = i + 1;
                }
                $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
                UtilsController.reloadCustomFormData(true);
                break;
        }
    }
};

export default ActionsController;
