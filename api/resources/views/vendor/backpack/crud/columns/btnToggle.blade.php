@php
    $checked = $entry->{$column['name']} ? true : false;
    $uniqueIdentifier = $entry->id . '-' . $column['name'];
@endphp
<td>
    <div id="personal-switch-{{ $uniqueIdentifier }}" class="custom-control custom-switch"
         data-model="{{ get_class($entry) }}"
         data-target="{{ $entry->id }}" data-field="{{ $column['name'] }}">
        <input type="checkbox" class="custom-control-input" id="customSwitch-{{ $uniqueIdentifier }}"
                {{ $checked ? 'checked' : '' }}>
        <label class="custom-control-label" for="customSwitch-{{ $uniqueIdentifier }}"></label>
    </div>
</td>

<script type="text/javascript">
    $("#personal-switch-{{ $uniqueIdentifier }}").on('click', function (ev) {
        var model = $(this).data('model');
        var id = $(this).data('target');
        var field = $(this).data('field');
        $.ajax({
            type: 'POST',
            url: "{{ route('toggleField') }}",
            data: {
                model: model,
                id: id,
                field: field
            },

            success: function (result) {
                if (!result.checked) {
                    $('#customSwitch-{{ $uniqueIdentifier }}').prop('checked', false);
                } else {
                    $('#customSwitch-{{ $uniqueIdentifier }}').prop('checked', true);
                }
                new Noty({
                    type: "success",
                    text: "{{ trans('admin.'.$column['name']) }} actualizado correctamente",
                }).show();
            }
        });
        ev.preventDefault();
    })
</script>
