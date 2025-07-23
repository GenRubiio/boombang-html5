
import UtilsController from './UtilsController.js';
import Attr from './Attr.js';

const InputModalValidationsController = {
    trans: Attr.trans,
    attr: {
        alert: ".alert-creat-input-form"
    },
    createMethodValidations() {
        let alert = $(this.attr.alert);
        UtilsController.showAlert(alert, '', false);
        if (!this.validateSlug()) {
            return false;
        }
        if (!this.validateInputType()) {
            return false;
        }
        if (!this.validateLabel()) {
            return false;
        }
        if (!this.validateOptions()) {
            return false;
        }
        return true;
    },
    updateMethodValidations() {
        let alert = $(this.attr.alert);
        UtilsController.showAlert(alert, '', false);
        if (!this.validateInputType()) {
            return false;
        }
        if (!this.validateLabel()) {
            return false;
        }
        if (!this.validateOptions()) {
            return false;
        }
        return true;
    },
    validateLabel() {
        let alert = $(this.attr.alert);
        let text = window.newInputObject.label;
        if (text == '' || text == null) {
            UtilsController.showAlert(alert, this.trans.error_label_required, true);
            return false;
        }
        return true;
    },
    validateInputType() {
        let alert = $(this.attr.alert);
        if (window.newInputObject.type) {
            return true;
        }
        UtilsController.showAlert(alert, this.trans.error_input_type_required, true);
        return false;
    },
    validateSlug() {
        let alert = $(this.attr.alert);
        let text = window.newInputObject.name;
        if (text == '' || text == null) {
            UtilsController.showAlert(alert, this.trans.error_name_of_input_required, true);
            return false;
        } else if (UtilsController.isNameExistInAnothersInputs(UtilsController.createSlug(text))) {
            UtilsController.showAlert(alert, this.trans.error_name_of_input_unique, true);
            return false;
        }
        return true;
    },
    validateOptions() {
        let alert = $(this.attr.alert);
        let inputType = window.newInputObject.type;
        if (inputType == 'select' || inputType == 'radio' || inputType == 'checkbox') {
            if (window.newInputObject.options.length == 0) {
                UtilsController.showAlert(alert, this.trans.error_no_options_created, true);
                return false;
            }
        }
        return true;
    }
};

export default InputModalValidationsController;
