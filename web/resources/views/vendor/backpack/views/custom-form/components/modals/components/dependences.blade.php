<style>
    .custom-form-dependence-inputs-container {
        padding: 0px 10px;
    }

    .custom-form-dependence-input {
        position: relative;
        padding: 5px 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 10px;
        background-color: #e6e6e652;
    }

    .custom-form-dependence-input_controls {
        position: absolute;
        left: -12px;
    }

    .custom-form-dependence-form_controls-button {
        height: 1.5rem;
        width: 1.5rem;
        border-radius: 50%;
        margin-bottom: 2px;
        overflow: hidden;
        border-width: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .control-border {
        border: 1px solid grey;
    }
</style>

<div>
    <label>{{ trans('custom-form.dependences') }}</label>
    <div class="custom-form-dependences-container">
        <div class="custom-form-dependence-input d-none">
            <div class="custom-form-dependence-input_controls">
                <div>
                    <button type="button" class="custom-form-dependence-form_controls-button control-border"
                        data-action="delete">
                        <span>×</span>
                    </button>
                </div>
            </div>
            <div>
                <div class="form-row mb-2">
                    <div class="col">
                        <div class="form-group">
                            <label>{{ trans('custom-form.field') }}</label>
                            <select class="form-control custom-form_dependences_select-inputs">
                                <option value="" selected disabled hidden>
                                    {{ trans('custom-form.choose_option') }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label>{{ trans('custom-form.value') }}</label>
                            <select class="form-control custom-form_dependences_select-input_options"></select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <button id="custom-form-dependences-container_button_create" class="btn btn-primary btn-sm">
        + {{ trans('custom-form.create_option') }}
    </button>
</div>
<hr>
