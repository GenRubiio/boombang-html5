
import UtilsController from './controllers/UtilsController.js';
import ActionsController from './controllers/ActionsController.js';
import InputModalUpdateController from './controllers/InputModalUpdateController.js';
import InputModalController from './controllers/InputModalController.js';
import InputModalCreateController from './controllers/InputModalCreateController.js';
import InputModalRepeatableController from './controllers/InputModalRepeatableController.js';
import LineModalController from './controllers/LineModalController.js';
import LineModalCreateController from './controllers/LineModalCreateController.js';
import SectionModalController from './controllers/SectionModalController.js';
import SectionModalUpdateController from './controllers/SectionModalUpdateController.js';
import SectionModalCreateController from './controllers/SectionModalCreateController.js';
import InputModalDependencesController from './controllers/InputModalDependencesController.js';

document.addEventListener("DOMContentLoaded", () => {
    initControllers();
    initObjects();
    UtilsController.reloadCustomFormData();
});

function initControllers() {
    ActionsController.init();
    InputModalController.init();
    InputModalCreateController.init();
    InputModalUpdateController.init();
    InputModalRepeatableController.init();
    LineModalController.init();
    LineModalCreateController.init();
    SectionModalController.init();
    SectionModalUpdateController.init();
    SectionModalCreateController.init();
    InputModalDependencesController.init();
}

function initObjects() {
    window.newInputObject = {
        label: '',
        placeholder: '',
        type: null,
        name: '',
        show_label: true,
        required: true,
        active: true,
        options: [],
        dependences: [],
        show_in_preview: true,
        update_in_preview: true,
        show_in_email: true
    };
    window.cloneNewInputObject = JSON.parse(JSON.stringify(window.newInputObject));
    
    window.newLineObject = {
        hash_section: null,
        type: "line",
        admin_panel: {
            permission_update: true,
            permission_delete: true,
            permission_create: true
        },
        total_columns: 1,
        columns: []
    };
    window.cloneNewLineObject = JSON.parse(JSON.stringify(window.newLineObject));

    window.newSectionObject = {
        title: null,
        type: "section",
        admin_panel: {
            permission_update: true,
            permission_delete: true,
            permission_create: true
        },
        lines: [],
    };
    window.cloneNewSectionObject = JSON.parse(JSON.stringify(window.newSectionObject));
}
