const Attr = {
    customFormInput: '#custom_form_data',
    section: {
        modal: {
            modal: '#modalSection',
            title: '#modalSectionLabel',
            openButton: 'button[data-target="#modalSection"]',
            saveButton: '#creat-section-form_submit-button',
            inputs: {
                title: 'input[name="creat-section-form_title"]',
                permissionCreate: 'input[name="creat-section-form_permission_create"]',
                permissionUpdate: 'input[name="creat-section-form_permission_update"]',
                permissionDelete: 'input[name="creat-section-form_permission_delete"]',
            },
            lang: {
                langContainer: '#modal-change-lang_section_modal',
                defaultLangLabel: '.current-language_section_modal',
                optionButton: '.language_section_modal-option_button',
            }
        }
    },
    line: {
        modal: {

        }
    },
    input: {
       
    },
    actions: {

    },
    trans: JSON.parse($('#custom_form_data').attr('data-translations')),
};
export default Attr;
