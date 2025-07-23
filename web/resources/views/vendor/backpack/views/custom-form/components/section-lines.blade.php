<div class="lines-section">
    @foreach ($section['lines'] as $line)
        <div class="line-container" data-hash="{{ $line['hash'] }}">
            <div class="custom-form_controls-top">
                @if ($section['admin_panel']['permission_delete'])
                    @include('vendor.backpack.views.custom-form.components.controls.control-delete', [
                        'item' => $line,
                    ])
                @endif
                @if ($section['admin_panel']['permission_update'])
                    @include('vendor.backpack.views.custom-form.components.controls.control-update', [
                        'item' => $line,
                    ])
                @endif
            </div>
            <div class="custom-form_controls-left">
                @if ($line['order'] > 1)
                    @include('vendor.backpack.views.custom-form.components.controls.control-up', [
                        'item' => $line,
                    ])
                @endif
                @if ($line['order'] < count($section['lines']))
                    @include('vendor.backpack.views.custom-form.components.controls.control-down', [
                        'item' => $line,
                    ])
                @endif
            </div>
            @php
                $colClass = 'col-md-' . 12 / $line['total_columns'];
            @endphp
            <div class="row">
                @foreach ($line['columns'] as $column)
                    @php
                        $currentInput = $column['input'];
                    @endphp
                    <div class="{{ $colClass }}">
                        @include('vendor.backpack.views.custom-form.components.container-inputs')
                    </div>
                @endforeach
            </div>
        </div>
    @endforeach
    @if ($section['admin_panel']['permission_create'])
        <button type="button" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#modalLine"
            data-order="{{ count($section['lines']) + 1 }}" data-hash-section="{{ $section['hash'] }}">
            + {{ trans('custom-form.add_line') }}
        </button>
    @endif
</div>
