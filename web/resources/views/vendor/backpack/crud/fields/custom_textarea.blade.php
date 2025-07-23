{{-- CKeditor --}}
@php
    $field['extra_plugins'] = isset($field['extra_plugins']) ? implode(',', $field['extra_plugins']) : '';

    $defaultOptions = [
        'language' => app()->getLocale(),
        'filebrowserBrowseUrl' => backpack_url('elfinder/ckeditor'),
        'extraPlugins' => $field['extra_plugins'],
        'embed_provider' => '//ckeditor.iframe.ly/api/oembed?url={url}&callback={callback}',
    ];

    $field['options'] = array_merge(
        $defaultOptions,
        [
            'removePlugins' => $field['data']['removePlugins'] ?? [],
            'toolbar' => $field['data']['toolbar'] ?? [],
        ] ?? [],
    );
@endphp

@include('crud::fields.inc.wrapper_start')
<label>{!! $field['label'] !!}</label>
@include('crud::fields.inc.translatable_icon')
<textarea name="{{ $field['name'] }}" data-init-function="bpFieldInitCKEditorElement"
          data-options="{{ trim(json_encode($field['options'])) }}" bp-field-main-input @include('crud::fields.inc.attributes', ['default_class' => 'form-control'])>{{ old_empty_or_null($field['name'], '') ?? ($field['value'] ?? ($field['default'] ?? '')) }}</textarea>

{{-- HINT --}}
@if (isset($field['hint']))
    <p class="help-block">{!! $field['hint'] !!}</p>
@endif
@include('crud::fields.inc.wrapper_end')


{{-- ########################################## --}}
{{-- Extra CSS and JS for this particular field --}}
{{-- If a field type is shown multiple times on a form, the CSS and JS will only be loaded once --}}

{{-- FIELD JS - will be loaded in the after_scripts section --}}
@push('crud_fields_scripts')
    @if (isset($field['custom_build']))
        @foreach ($field['custom_build'] as $script)
            @basset($script)
        @endforeach
    @else
        @basset('https://cdn.ckeditor.com/ckeditor5/36.0.1/classic/ckeditor.js')

        @bassetBlock('backpack/pro/fields/ckeditor.js')
        <script>
            async function bpFieldInitCKEditorElement(element) {
                let ckeditor = await ClassicEditor.create(element[0], element.data('options'));
                if (!ckeditor) return;

                element.on('CrudField:delete', function(e) {
                    ckeditor.destroy();
                });

                // trigger the change event on textarea when ckeditor changes
                ckeditor.editing.view.document.on('layoutChanged', function(e) {
                    element.trigger('change');
                });

                element.on('CrudField:disable', function(e) {
                    ckeditor.enableReadOnlyMode('CrudField');
                });

                element.on('CrudField:enable', function(e) {
                    ckeditor.disableReadOnlyMode('CrudField');
                });
            }
        </script>
        @endBassetBlock
    @endif
@endpush

{{-- End of Extra CSS and JS --}}
{{-- ########################################## --}}
