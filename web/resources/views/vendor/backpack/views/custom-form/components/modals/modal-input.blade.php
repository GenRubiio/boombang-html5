<div class="modal fade" id="modalInput" tabindex="-1" role="dialog" aria-labelledby="modalInputLabel" aria-hidden="true"
    style="background-color:#0000005c" data-backdrop="false">
    <div class="modal-dialog modal-lg" role="document">
        <form id="creat-input-form">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalInputLabel">{{ trans('custom-form.create_input') }}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-danger alert-creat-input-form d-none" role="alert"></div>
                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab"
                                aria-controls="home" aria-selected="true">{{ trans('custom-form.field') }}</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="dependences-tab" data-toggle="tab" href="#dependences"
                                role="tab" aria-controls="dependences"
                                aria-selected="false">{{ trans('custom-form.dependences') }}</a>
                        </li>
                    </ul>
                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active" id="home" role="tabpanel"
                            aria-labelledby="home-tab">
                            @include('vendor.backpack.views.custom-form.components.modals.components.translations')
                            <div class="form-row">
                                <div class="col">
                                    <label>{{ trans('custom-form.label') }} <span style="color: red">*</span></label> <i
                                        class="la la-flag-checkered pull-right" style="margin-top: 3px;"
                                        title="This field is translatable."></i>
                                    <input name="creat-input-form_label" type="text" class="form-control">
                                </div>
                                <div class="col">
                                    <label>{{ trans('custom-form.placeholder') }}</label> <i
                                        class="la la-flag-checkered pull-right" style="margin-top: 3px;"
                                        title="This field is translatable."></i>
                                    <input name="creat-input-form_placeholder" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="form-check">
                                    <input name="creat-input-form_show_label" class="form-check-input" type="checkbox"
                                        value="" checked>
                                    <label class="form-check-label">
                                        {{ trans('custom-form.show_label') }}
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>{{ trans('custom-form.input_type') }} <span style="color: red">*</span></label>
                                <select id="select-input-type-custom-form" class="form-control" name="type">
                                    <option selected="true" disabled="disabled">
                                        {{ trans('custom-form.choose_option') }}
                                    </option>
                                    <option value="select">{{ trans('custom-form.input_select') }}</option>
                                    <option value="text">{{ trans('custom-form.input_text') }}</option>
                                    <option value="number">{{ trans('custom-form.input_number') }}</option>
                                    <option value="email">{{ trans('custom-form.input_email') }}</option>
                                    <option value="radio">{{ trans('custom-form.input_radio') }}</option>
                                    <option value="checkbox">{{ trans('custom-form.input_checkbox') }}</option>
                                    <option value="date">{{ trans('custom-form.input_date') }}</option>
                                    <option value="textarea">{{ trans('custom-form.input_textarea') }}</option>
                                    <option value="image">{{ trans('custom-form.input_image') }}</option>
                                </select>
                            </div>
                            <div id="select-options" class="form-group d-none">
                                <hr>
                                @include('vendor.backpack.views.custom-form.components.modals.components.repeatable')
                                <hr>
                            </div>
                            <div class="form-group">
                                <label>{{ trans('custom-form.name_of_input') }} <span style="color: red">*</span></label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <div class="input-group-text custom-form_prefix-entity-name">form_</div>
                                    </div>
                                    <input name="creat-input-form_name" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="form-group">
                                <hr>
                                <div class="form-check">
                                    <input name="creat-input-form_required" class="form-check-input" type="checkbox"
                                        value="" checked>
                                    <label class="form-check-label">
                                        {{ trans('custom-form.required') }}
                                    </label>
                                </div>
                                <div class="form-check d-none">
                                    <input name="creat-input-form_show_in_preview" class="form-check-input" type="checkbox"
                                        value="" checked>
                                    <label class="form-check-label">
                                        {{ trans('custom-form.show_in_preview_list') }}
                                    </label>
                                </div>
                                <div class="form-check d-none">
                                    <input name="creat-input-form_update_in_preview" class="form-check-input" type="checkbox"
                                        value="" checked>
                                    <label class="form-check-label">
                                        {{ trans('custom-form.update_in_preview_list') }}
                                    </label>
                                </div>
                                <div class="form-check d-none">
                                    <input name="creat-input-form_show_in_email" class="form-check-input" type="checkbox"
                                        value="" checked>
                                    <label class="form-check-label">
                                        {{ trans('custom-form.show_in_email') }}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="dependences" role="tabpanel"
                            aria-labelledby="dependences-tab">
                            @include('vendor.backpack.views.custom-form.components.modals.components.dependences')
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary"
                        data-dismiss="modal">{{ trans('custom-form.close') }}</button>
                    <button id="creat-input-form_submit-button" type="button"
                        class="btn btn-primary">{{ trans('custom-form.create') }}</button>
                </div>
            </div>
        </form>
    </div>
</div>
