
import UtilsController from './UtilsController.js';
import Attr from './Attr.js';

const LineModalController = {
    trans: Attr.trans,
    attr: {
        modal: '#modalLine',
        modalOpenButton: '.lines-section button[data-target="#modalLine"]',
        alert: ".alert-creat-input-form",
        inputs: {
            total_columns: 'input[name="custom_form_selected_line_columns"]',
            permission_create: 'input[name="creat-line-form_permission_create"]',
            permission_update: 'input[name="creat-line-form_permission_update"]',
            permission_delete: 'input[name="creat-line-form_permission_delete"]',
        },
    },
    init() {
        this.setListeners();
    },
    setListeners() {
        $(document).on('click', this.attr.modalOpenButton, (ev) => this.openModelCreateHandler(ev));
        $(document).on('hidden.bs.modal', this.attr.modal, (ev) => this.closeModalHandler(ev));
        $(document).on('click change', this.attr.inputs.total_columns, (ev) => this.setTotalInputsInputHandler(ev));
        $(document).on('change', this.attr.inputs.permission_create, (ev) => this.setPermissionCreateInputHandler(ev));
        $(document).on('change', this.attr.inputs.permission_update, (ev) => this.setPermissionUpdateInputHandler(ev));
        $(document).on('change', this.attr.inputs.permission_delete, (ev) => this.setPermissionDeleteInputHandler(ev));
    },
    openModelCreateHandler(ev) {
        $('#modalLineLabel').text(this.trans.create_line);
        $('#creat-line-form_submit-button').text(this.trans.create);
        let hashSection = $(ev.currentTarget).attr('data-hash-section');
        let order = $(ev.currentTarget).attr('data-order');

        $('#creat-line-form_submit-button').attr('data-hash-section', hashSection);
        $('#creat-line-form_submit-button').attr('data-order', order);
        $('#creat-line-form_submit-button').attr('data-method', 'create');
    },
    closeModalHandler(ev) {
        UtilsController.reloadCustomFormData();
    },
    setTotalInputsInputHandler(ev) {
        let totalColumns = $(ev.currentTarget).val();
        window.newLineObject.total_columns = totalColumns;
    },
    setPermissionCreateInputHandler(ev) {
        window.newLineObject.admin_panel.permission_create = $(ev.currentTarget).prop('checked');
    },
    setPermissionUpdateInputHandler(ev) {
        window.newLineObject.admin_panel.permission_update = $(ev.currentTarget).prop('checked');
    },
    setPermissionDeleteInputHandler(ev) {
        window.newLineObject.admin_panel.permission_delete = $(ev.currentTarget).prop('checked');
    },
};

export default LineModalController;
