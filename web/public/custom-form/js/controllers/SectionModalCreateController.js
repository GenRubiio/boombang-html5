import UtilsController from './UtilsController.js';
import Attr from './Attr.js';

const SectionModalCreateController = {
    attr: Attr,
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('click', this.attr.section.modal.saveButton, (ev) => this.saveFormHandler(ev));
    },
    saveFormHandler(ev) {
        let button = $(ev.currentTarget);
        let method = button.attr('data-method');
        $(this.attr.section.modal.modal).animate({
            scrollTop: 0
        }, 500);

        let customFormJsonData = UtilsController.inputCustomFormValue();
        let order = button.attr('data-order');
        if (method == "create") {
            customFormJsonData.form_sections.push({
                hash: UtilsController.creatHash(),
                title: window.newSectionObject.title,
                type: window.newSectionObject.type,
                order: order,
                admin_panel: {
                    permission_create: window.newSectionObject.admin_panel.permission_create,
                    permission_update: window.newSectionObject.admin_panel.permission_update,
                    permission_delete: window.newSectionObject.admin_panel.permission_delete
                },
                lines: []
            });
        }
        if (method == "update") {
            let section = customFormJsonData.form_sections.find(section => section.hash == window.newSectionObject.hash);
            section.title = window.newSectionObject.title;
            section.admin_panel.permission_create = window.newSectionObject.admin_panel.permission_create;
            section.admin_panel.permission_update = window.newSectionObject.admin_panel.permission_update;
            section.admin_panel.permission_delete = window.newSectionObject.admin_panel.permission_delete;
        }

        button.closest('.modal').modal('hide');
        document.body.style.overflow = 'scroll';
        $(this.attr.customFormInput).val(JSON.stringify(customFormJsonData));
        UtilsController.savedAlert();
        UtilsController.reloadCustomFormData();
    },
};

export default SectionModalCreateController;
