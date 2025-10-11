@php
    $checked = $entry->{$column['name']} ? true : false;
    $uniqueIdentifier = $entry->id . '-' . $column['name'];
@endphp

<style>
    /* --- Estilo general del switch --- */
    .custom-control.custom-switch {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 26px;
    }

    /* Ocultamos el checkbox original */
    .custom-control-input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    /* El fondo del interruptor */
    .custom-control-label {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        border-radius: 34px;
        transition: background-color 0.3s ease;
    }

    /* El círculo deslizante */
    .custom-control-label::before {
        content: "";
        position: absolute;
        height: 20px;
        width: 20px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        border-radius: 50%;
        transition: transform 0.3s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    /* Estado activado */
    .custom-control-input:checked + .custom-control-label {
        background-color: #7c69ef;
    }

    /* Círculo desplazado a la derecha */
    .custom-control-input:checked + .custom-control-label::before {
        transform: translateX(22px);
    }

    /* Estado hover */
    .custom-control-label:hover {
        background-color: #bfbfbf;
    }

    /* Estado activo (clicado) */
    .custom-control-input:active + .custom-control-label::before {
        width: 24px;
    }

    /* Estado deshabilitado */
    .custom-control-input:disabled + .custom-control-label {
        background-color: #e0e0e0;
        cursor: not-allowed;
        opacity: 0.7;
    }
</style>

<td>
    <div id="personal-switch-{{ $uniqueIdentifier }}" class="custom-control custom-switch"
         data-model="{{ get_class($entry) }}"
         data-target="{{ $entry->id }}"
         data-field="{{ $column['name'] }}">
        <input type="checkbox"
               class="custom-control-input"
               id="customSwitch-{{ $uniqueIdentifier }}"
               {{ $checked ? 'checked' : '' }}>
        <label class="custom-control-label" for="customSwitch-{{ $uniqueIdentifier }}"></label>
    </div>
</td>

<script type="text/javascript">
    $("#personal-switch-{{ $uniqueIdentifier }}").on('click', function (ev) {
        ev.preventDefault();

        var $switch = $(this).find('input[type=checkbox]');
        var model = $(this).data('model');
        var id = $(this).data('target');
        var field = $(this).data('field');

        // 🔒 Bloqueamos el toggle para evitar clics múltiples
        $switch.prop('disabled', true);

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
                    $switch.prop('checked', false);
                } else {
                    $switch.prop('checked', true);
                }

                new Noty({
                    type: "success",
                    text: "{{ trans('admin.' . $column['name']) }} actualizado correctamente",
                }).show();
            },
            error: function () {
                new Noty({
                    type: "error",
                    text: "Error al actualizar {{ trans('admin.' . $column['name']) }}",
                }).show();
            },
            complete: function () {
                // 🔓 Rehabilitamos el toggle al terminar (éxito o error)
                setTimeout(() => {
                    $switch.prop('disabled', false);
                }, 500);
            }
        });
    });
</script>
