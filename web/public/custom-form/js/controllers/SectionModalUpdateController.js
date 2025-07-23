import UtilsController from './UtilsController.js';
import Attr from './Attr.js';

const SectionModalUpdateController = {
    attr: Attr,
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('click', this.attr.section.modal.lang.optionButton, (ev) => this.setLangOptionButtonHandler(ev));
    },
    setLangOptionButtonHandler(ev) {
        ev.preventDefault();

        let lang = $(ev.currentTarget).attr('data-local');
        let langName = $(ev.currentTarget).attr('data-lang-name');
        $(this.attr.section.modal.lang.defaultLangLabel).text(langName);
        $(this.attr.section.modal.lang.langContainer).attr('data-lang', lang);
        let item = JSON.parse($(this.attr.section.modal.modal).attr('data-item'));
        this.setInputsForm(item, lang);
    },
    setInputsForm(item, lang) {
        let title = UtilsController.getTranslation(lang, item.title);
        $(this.attr.section.modal.inputs.title).val(title);
        $(this.attr.section.modal.inputs.permissionCreate).prop('checked', item.admin_panel.permission_create);
        $(this.attr.section.modal.inputs.permissionUpdate).prop('checked', item.admin_panel.permission_update);
        $(this.attr.section.modal.inputs.permissionDelete).prop('checked', item.admin_panel.permission_delete);

        window.newSectionObject = {
            hash: item.hash,
            title: item.title,
            order: item.order,
            admin_panel: {
                permission_create: item.admin_panel.permission_create,
                permission_update: item.admin_panel.permission_update,
                permission_delete: item.admin_panel.permission_delete
            }
        };
    },
    openModalUpdateHandler(item) {
        let lang = $(this.attr.section.modal.lang.langContainer).attr('data-lang');

        $(this.attr.section.modal.title).text(this.attr.trans.update_section);
        $(this.attr.section.modal.saveButton).text(this.attr.trans.save);
        $(this.attr.section.modal.saveButton).attr('data-order', item.order);
        $(this.attr.section.modal.saveButton).attr('data-method', 'update');
        $(this.attr.section.modal.modal).attr('data-item', JSON.stringify(item));
        $(this.attr.section.modal.lang.langContainer).removeClass('d-none');

        this.setInputsForm(item, lang);

        $(this.attr.section.modal.modal).modal('show');
    }
};

export default SectionModalUpdateController;
