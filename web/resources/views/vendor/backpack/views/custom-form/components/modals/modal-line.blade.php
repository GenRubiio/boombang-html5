<div class="modal fade" id="modalLine" tabindex="-1" role="dialog" aria-labelledby="modalLineLabel" aria-hidden="true"
    style="background-color:#0000005c" data-backdrop="false">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalLineLabel">{{ trans('custom-form.create_line') }}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="alert alert-danger alert-creat-line-form d-none" role="alert"></div>
                <label>{{ trans('custom-form.how_many_columns') }}</label>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group input-group-sm">
                            <div class="form-check">
                                <input name="custom_form_selected_line_columns" class="form-check-input" type="radio"
                                    value="1" checked="checked">
                                <label class="form-check-label">{{ trans('custom-form.1_column') }}</label>
                            </div>
                        </div>
                        <div class="line-design-container">
                            <div class="line-design-container-grid-1">
                                <div class="line-design-container_item"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group input-group-sm">
                            <div class="form-check">
                                <input name="custom_form_selected_line_columns" class="form-check-input" type="radio"
                                    value="2">
                                <label class="form-check-label">{{ trans('custom-form.2_columns') }}</label>
                            </div>
                        </div>
                        <div class="line-design-container">
                            <div class="line-design-container-grid-2">
                                <div class="line-design-container_item"></div>
                                <div class="line-design-container_item"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group input-group-sm">
                            <div class="form-check">
                                <input name="custom_form_selected_line_columns" class="form-check-input" type="radio"
                                    value="3">
                                <label class="form-check-label">{{ trans('custom-form.3_columns') }}</label>
                            </div>
                        </div>
                        <div class="line-design-container">
                            <div class="line-design-container-grid-3">
                                <div class="line-design-container_item"></div>
                                <div class="line-design-container_item"></div>
                                <div class="line-design-container_item"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group input-group-sm">
                            <div class="form-check">
                                <input name="custom_form_selected_line_columns" class="form-check-input" type="radio"
                                    value="4">
                                <label class="form-check-label">{{ trans('custom-form.4_columns') }}</label>
                            </div>
                        </div>
                        <div class="line-design-container">
                            <div class="line-design-container-grid-4">
                                <div class="line-design-container_item"></div>
                                <div class="line-design-container_item"></div>
                                <div class="line-design-container_item"></div>
                                <div class="line-design-container_item"></div>
                            </div>
                        </div>
                    </div>
                </div>
                @if (isSuperadmin())
                    <hr>
                    <label>{{ trans('custom-form.permissions') }}</label>
                    <div class="form-check">
                        <input name="creat-line-form_permission_create" class="form-check-input" type="checkbox"
                            value="" checked>
                        <label class="form-check-label">
                            {{ trans('custom-form.permission_create_field') }}
                        </label>
                    </div>
                    <div class="form-check">
                        <input name="creat-line-form_permission_update" class="form-check-input" type="checkbox"
                            value="" checked>
                        <label class="form-check-label">
                            {{ trans('custom-form.permission_update_field') }}
                        </label>
                    </div>
                    <div class="form-check">
                        <input name="creat-line-form_permission_delete" class="form-check-input" type="checkbox"
                            value="" checked>
                        <label class="form-check-label">
                            {{ trans('custom-form.permission_delete_field') }}
                        </label>
                    </div>
                @endif
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary"
                    data-dismiss="modal">{{ trans('custom-form.close') }}</button>
                <button id="creat-line-form_submit-button" type="button"
                    class="btn btn-primary">{{ trans('custom-form.create') }}</button>
            </div>
        </div>
    </div>
</div>
