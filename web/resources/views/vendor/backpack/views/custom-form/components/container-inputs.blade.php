<div class="input-container h-100 d-flex align-items-center" data-hash="{{ $column['hash'] }}">
    <div class="custom-form_controls-top">
        @if (!is_null($currentInput))
            @if ($line['admin_panel']['permission_delete'])
                @include('vendor.backpack.views.custom-form.components.controls.control-delete', [
                    'item' => $column,
                ])
            @endif
            @if ($line['admin_panel']['permission_update'])
                @include('vendor.backpack.views.custom-form.components.controls.control-update', [
                    'item' => $column,
                ])
            @endif
        @endif
    </div>
    <div class="custom-form_controls-left">
        @if ($column['order'] > 1)
            @include('vendor.backpack.views.custom-form.components.controls.control-left', [
                'item' => $column,
            ])
        @endif
    </div>
    <div class="custom-form_controls-right">
        @if ($column['order'] != $line['total_columns'])
            @include('vendor.backpack.views.custom-form.components.controls.control-right', [
                'item' => $column,
            ])
        @endif
    </div>
    @if (is_null($currentInput))
        <div class="h-100 w-100 d-flex justify-content-center align-items-center">
            @if ($line['admin_panel']['permission_create'])
                <button type="button" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modalInput"
                    data-order="{{ $column['order'] }}" data-hash-section="{{ $line['hash_section'] }}"
                    data-hash-line="{{ $line['hash'] }}">
                    + {{ trans('custom-form.add_field') }}
                </button>
            @endif
        </div>
    @else
        <div class="form-group w-100 h-100 pt-2">
            @if ($currentInput['show_label'])
                <label>{{ getTextTrans($currentInput['label']) }}</label>
            @else
                <label>-</label>
            @endif
            @switch($currentInput['type'])
                @case('text')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-text')
                @break

                @case('select')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-select')
                @break

                @case('radio')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-radio')
                @break

                @case('checkbox')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-checkbox')
                @break

                @case('number')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-number')
                @break

                @case('textarea')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-textarea')
                @break

                @case('telephone')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-telephone')
                @break

                @case('countries')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-countries')
                @break

                @case('email')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-text')
                @break

                @case('date')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-date')
                @break

                @case('image')
                    @include('vendor.backpack.views.custom-form.components.inputs.input-image')
                @break

                @default
            @endswitch
        </div>
    @endif
</div>
