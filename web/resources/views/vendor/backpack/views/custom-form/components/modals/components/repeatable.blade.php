<style>
    .repeatable_select-inputs-container {
        padding: 0px 10px;
    }

    .repeatable_select-input {
        position: relative;
        padding: 5px 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 10px;
        background-color: #e6e6e652;
    }

    .repeatable_select-input_controls {
        position: absolute;
        left: -12px;
    }

    .repeatable_select-form_controls-button {
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

<div class="repeatable_select-inputs-container">
    <div class="repeatable_select-input d-none">
        <div class="repeatable_select-input_controls">
            <div>
                <button type="button" class="repeatable_select-form_controls-button control-border" data-action="delete">
                    <span>×</span>
                </button>
            </div>
            <div>
                <button type="button" class="repeatable_select-form_controls-button control-border" data-action="up">
                    <svg viewBox="0 0 64 80">
                        <path
                            d="M46.8,36.7c-4.3-4.3-8.7-8.7-13-13c-1-1-2.6-1-3.5,0c-4.3,4.3-8.7,8.7-13,13c-2.3,2.3,1.3,5.8,3.5,3.5c4.3-4.3,8.7-8.7,13-13c-1.2,0-2.4,0-3.5,0c4.3,4.3,8.7,8.7,13,13C45.5,42.5,49,39,46.8,36.7L46.8,36.7z">
                        </path>
                    </svg>
                </button>
            </div>
            <div>
                <button type="button" class="repeatable_select-form_controls-button control-border" data-action="down">
                    <svg viewBox="0 0 64 80">
                        <path
                            d="M17.2,30.3c4.3,4.3,8.7,8.7,13,13c1,1,2.6,1,3.5,0c4.3-4.3,8.7-8.7,13-13c2.3-2.3-1.3-5.8-3.5-3.5c-4.3,4.3-8.7,8.7-13,13c1.2,0,2.4,0,3.5,0c-4.3-4.3-8.7-8.7-13-13C18.5,24.5,15,28,17.2,30.3L17.2,30.3z">
                        </path>
                    </svg>
                </button>
            </div>
        </div>
        <div>
            <div class="form-group">
                <label>{{ trans('custom-form.value') }}</label> <i class="la la-flag-checkered pull-right"
                    style="margin-top: 3px;" title="This field is translatable."></i>
                <input name="value" type="text" class="form-control">
            </div>
            <div class="form-check">
                <input name="default" class="form-check-input" type="checkbox" value="">
                <label class="form-check-label">
                    {{ trans('custom-form.default_value') }}
                </label>
            </div>
        </div>
    </div>
    <button id="repeatable_select-inputs-button_create" class="btn btn-primary btn-sm">
        + {{ trans('custom-form.create_option') }}
    </button>
</div>
