
import UtilsController from './UtilsController.js';
import Attr from './Attr.js';

const SectionModalController = {
    attr: Attr,
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('click', this.attr.section.modal.openButton, (ev) => this.openModelCreateHandler(ev));
        $(document).on('hidden.bs.modal', this.attr.section.modal.modal, (ev) => this.closeModalHandler(ev));
        $(document).on('keyup', this.attr.section.modal.inputs.title, (ev) => this.setTitleInputHandler(ev));
        $(document).on('change', this.attr.section.modal.inputs.permissionCreate, (ev) => this.setPermissionCreateInputHandler(ev));
        $(document).on('change', this.attr.section.modal.inputs.permissionUpdate, (ev) => this.setPermissionUpdateInputHandler(ev));
        $(document).on('change', this.attr.section.modal.inputs.permissionDelete, (ev) => this.setPermissionDeleteInputHandler(ev));
    },
    openModelCreateHandler(ev) {
        let order = $(ev.currentTarget).attr('data-order');

        $(this.attr.section.modal.title).text(this.attr.trans.create_section);
        $(this.attr.section.modal.saveButton).text(this.attr.trans.create);
        $(this.attr.section.modal.saveButton).attr('data-order', order);
        $(this.attr.section.modal.saveButton).attr('data-method', 'create');
    },
    closeModalHandler(ev) {
        UtilsController.reloadCustomFormData();
    },
    setTitleInputHandler(ev) {
        let lang = UtilsController.sectionModalLang();
        if (!window.newSectionObject.title) {
            window.newSectionObject.title = {};
        }
        window.newSectionObject.title[lang] = $(ev.currentTarget).val();
    },
    setPermissionCreateInputHandler(ev) {
        window.newSectionObject.admin_panel.permission_create = $(ev.currentTarget).prop('checked');
    },
    setPermissionUpdateInputHandler(ev) {
        window.newSectionObject.admin_panel.permission_update = $(ev.currentTarget).prop('checked');
    },
    setPermissionDeleteInputHandler(ev) {
        window.newSectionObject.admin_panel.permission_delete = $(ev.currentTarget).prop('checked');
    },
};

export default SectionModalController;
