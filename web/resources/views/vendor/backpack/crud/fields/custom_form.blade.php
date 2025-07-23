<style>
    .custom-form_loading-data {
        margin-bottom: 20px;
        color: #80808070;
        display: flex;
        align-items: center;
    }

    .custom-form_loading-data span {
        margin-right: 5px;
    }

    .custom-form_loading-data.hidden {
        visibility: hidden;
    }

    .custom-form_loading-data.show {
        visibility: visible;
    }

    .custom-form-section {
        position: relative;
    }

    .parent-container {
        border: 1px solid #80808059;
        border-radius: 5px;
        padding: 10px;
        margin-bottom: 15px;
    }

    .custom-form-section_block {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        z-index: 1;
    }
</style>
@php
    if (!isset($field['value']) || is_null($field['value'])) {
        $field['value'] = json_encode([
            'form_sections' => [],
        ]);
    } else {
        $field['value'] = json_encode($field['value']);
    }
    $translations = json_encode((array) trans('custom-form.js'));
@endphp
<div class="col-12" id="custom-form-section">
    <div class="parent-container">
        @if (isset($field['label']))
            <label>{{ $field['label'] }}</label>
        @endif
        <div class="custom-form-section_block d-none"></div>
        <div class="custom-form_loading-data hidden">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ trans('custom-form.loading') }}
        </div>
        <input type="hidden" name="{{ $field['name'] }}" id="custom_form_data" value="{{ $field['value'] }}"
            data-route="{{ $field['route'] }}" data-lang-default="{{ app()->getLocale() }}"
            data-translations="{{ $translations }}" data-entity-name="{{ $field['entity_name'] }}">
        <div id="result_custom_form"></div>
    </div>
</div>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        $(document).on('submit', 'form', function(ev) {
            $('#result_custom_form').html('');
            $('.custom-form_loading-data').removeClass('hidden').addClass('show');
            $('.custom-form_loading-data').removeClass('d-none');
        })
    });
</script>
<script type="module" src="{{ url('custom-form/js/setup.js') }}"></script>
