<div class="section-container" data-hash="{{ $section['hash'] }}">
    <div class="custom-form_controls-top">
        @include('vendor.backpack.views.custom-form.components.controls.control-delete', [
            'item' => $section,
        ])
        @include('vendor.backpack.views.custom-form.components.controls.control-update', [
            'item' => $section,
        ])
    </div>
    <div class="custom-form_controls-left">
        @if ($section['order'] > 1)
            @include('vendor.backpack.views.custom-form.components.controls.control-up', [
                'item' => $section,
            ])
        @endif
        @if ($section['order'] < count($request->form_sections))
            @include('vendor.backpack.views.custom-form.components.controls.control-down', [
                'item' => $section,
            ])
        @endif
    </div>
    @if ($section['title'])
        <p><b>{{ trans('custom-form.title') }}</b>: {{ getTextTrans($section['title']) }}</p>
        <hr>
    @endif
    @include('vendor.backpack.views.custom-form.components.section-lines', [
        'lines' => $section['lines'],
    ])
</div>
