
import Attr from './Attr.js';

const LineModalUpdateController = {
    trans: Attr.trans,
    attr: {
        modalLine: {
            el: '#modalLine',
            label: '#modalLineLabel',
            submitButton: '#creat-line-form_submit-button',
            inputColumns: 'input[name="custom_form_selected_line_columns"]',
            inputPermissionCreate: 'input[name="creat-line-form_permission_create"]',
            inputPermissionUpdate: 'input[name="creat-line-form_permission_update"]',
            inputPermissionDelete: 'input[name="creat-line-form_permission_delete"]',
        },
    },
    openModalUpdateHandler(item) {
        $(this.attr.modalLine.label).text(this.trans.update_line);
        $(this.attr.modalLine.submitButton).text(this.trans.save);
        $(this.attr.modalLine.submitButton).attr('data-hash-section', item.hash_section);
        $(this.attr.modalLine.submitButton).attr('data-order', item.order);
        $(this.attr.modalLine.submitButton).attr('data-method', 'update');
        $(this.attr.modalLine.el).attr('data-item', JSON.stringify(item));
        $(this.attr.modalLine.el).modal('show');

        this.setInputsForm(item);
    },
    setInputsForm(item) {
        let inputs = $(this.attr.modalLine.inputColumns);
        inputs.each((index, element) => {
            if ($(element).val() == item.total_columns) {
                $(element).prop('checked', true);
            }
        });

        $(this.attr.modalLine.inputPermissionCreate).prop('checked', item.admin_panel.permission_create);
        $(this.attr.modalLine.inputPermissionUpdate).prop('checked', item.admin_panel.permission_update);
        $(this.attr.modalLine.inputPermissionDelete).prop('checked', item.admin_panel.permission_delete);

        window.newLineObject = {
            hash: item.hash,
            hash_section: item.hash_section,
            type: "line",
            order: item.order,
            admin_panel: {
                permission_update: item.admin_panel.permission_update,
                permission_delete: item.admin_panel.permission_delete,
                permission_create: item.admin_panel.permission_create
            },
            total_columns: item.total_columns,
            columns: item.columns
        };
    },
};

export default LineModalUpdateController;
