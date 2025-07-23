<div class="modal fade" id="modalSection" tabindex="-1" role="dialog" aria-labelledby="modalSectionLabel" aria-hidden="true"
    style="background-color:#0000005c" data-backdrop="false">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalSectionLabel">{{ trans('custom-form.create_section') }}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                @include('vendor.backpack.views.custom-form.components.modals.components.translations-section')
                <div class="form-group">
                    <label>{{ trans('custom-form.title') }}</label> <i class="la la-flag-checkered pull-right"
                        style="margin-top: 3px;" title="This field is translatable."></i>
                    <input name="creat-section-form_title" type="text" class="form-control">
                </div>
                @if (isSuperadmin())
                    <hr>
                    <label>{{ trans('custom-form.permissions') }}</label>
                    <div class="form-check">
                        <input name="creat-section-form_permission_create" class="form-check-input" type="checkbox"
                            value="" checked>
                        <label class="form-check-label">
                            {{ trans('custom-form.permission_create_line') }}
                        </label>
                    </div>
                    <div class="form-check">
                        <input name="creat-section-form_permission_update" class="form-check-input" type="checkbox"
                            value="" checked>
                        <label class="form-check-label">
                            {{ trans('custom-form.permission_update_line') }}
                        </label>
                    </div>
                    <div class="form-check">
                        <input name="creat-section-form_permission_delete" class="form-check-input" type="checkbox"
                            value="" checked>
                        <label class="form-check-label">
                            {{ trans('custom-form.permission_delete_line') }}
                        </label>
                    </div>
                @endif
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary"
                    data-dismiss="modal">{{ trans('custom-form.close') }}</button>
                <button id="creat-section-form_submit-button" type="button" class="btn btn-primary">
                    {{ trans('custom-form.save') }}
                </button>
            </div>
        </div>
    </div>
</div>
