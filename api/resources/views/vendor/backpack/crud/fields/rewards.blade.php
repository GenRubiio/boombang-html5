{{-- REPEATABLE FIELD TYPE --}}

@php
    $field['value'] = old_empty_or_null($field['name'], []) ??  $field['value'] ?? $field['default'] ?? [];
    // make sure the value is always an array, even if stored as JSON in database
    $field['value'] = is_string($field['value']) ? json_decode($field['value'], true) : $field['value'];

    if(!empty($field['value'])) {
        // when repeatable is used to create relations the value returned from those relations
        // would be collections, contrary to when saved as json in database and casted as array
        if (is_a($field['value'], \Illuminate\Support\Collection::class)) {
            $field['value'] = $field['value']->toArray();
        }
    }

    $field['init_rows'] = $field['init_rows'] ?? $field['min_rows'] ?? 0;
    $field['max_rows'] = $field['max_rows'] ?? 0;
    $field['min_rows'] =  $field['min_rows'] ?? 0;
    $field['subfields'] = $field['subfields'] ?? $field['fields'] ?? [];
    $field['reorder'] = $field['reorder'] ?? true;
    $field['wrapper']['class']  = isset($field['wrapper']['class']) ? $field['wrapper']['class'].' repeatable-group' : 'form-group col-sm-12 repeatable-group';

    if($field['reorder'] !== false) {
        switch(gettype($field['reorder'])) {
            case 'string': {
                $field['subfields'] = Arr::prepend($field['subfields'], [
                    'name' => $field['reorder'],
                    'type' => 'hidden',
                    'attributes' => [
                        'data-reorder-input' => true
                    ]
                ]);
                usort($field['value'], fn($a, $b) => $a[$field['reorder']] <=> $b[$field['reorder']]);
            }
            break;
            case 'array': {
                $field['subfields'] = Arr::prepend($field['subfields'], $field['reorder']);
                usort($field['value'], fn($a, $b) => $a[$field['reorder']['name']] <=> $b[$field['reorder']['name']]);
            }
            break;
        }
    }

    $subfieldNames = array_column(array_map(function($item) {
        $item['name'] = square_brackets_to_dots(implode(',', (array)$item['name']));
        return $item;
    }, $field['subfields']), 'name');
@endphp

@include('crud::fields.inc.wrapper_start')
<label>{!! $field['label'] !!}</label>
@include('crud::fields.inc.translatable_icon')
<input
    type="hidden"
    name="{{ $field['name'] }}"
    bp-field-main-input
    data-init-function="bpFieldInitRepeatableElement"
    @include('crud::fields.inc.attributes')
>

<div class="container-repeatable-elements">
    <div
        data-repeatable-holder="{{ $field['name'] }}"
        data-init-rows="{{ $field['init_rows'] }}"
        data-max-rows="{{ $field['max_rows'] }}"
        data-min-rows="{{ $field['min_rows'] }}"
        data-subfield-names="{{json_encode($subfieldNames)}}"

    >
    @if(!empty($field['value']))
        @foreach ($field['value'] as $key => $row)
            @include($crud->getFirstFieldView('inc.repeatable_row'), ['repeatable_row_key' => $key])
        @endforeach
        @php
            // the $row variable still exists. We don't need it anymore the loop is over, and would have impact in the following code.
            unset($row);
        @endphp
    @endif
    </div>
</div>

{{-- HINT --}}
@if (isset($field['hint']))
    <p class="help-block text-muted text-sm">{!! $field['hint'] !!}</p>
@endif
<button type="button" class="btn btn-outline-primary btn-sm ml-1 mt-2 add-repeatable-element-button">+ {{ $field['new_item_label'] ?? trans('backpack::crud.new_item') }}</button>

@include('crud::fields.inc.wrapper_end')

@push('crud_fields_scripts')
    @include($crud->getFirstFieldView('inc.repeatable_row'), ['hidden' => true])
@endpush

  {{-- FIELD EXTRA CSS --}}
  {{-- push things in the after_styles section --}}

  @push('crud_fields_styles')
      @bassetBlock('backpack/pro/fields/repeatable-field.css')
      <style type="text/css">
        .repeatable-element {
          border: 1px solid rgba(0,40,100,.12);
          border-radius: 5px;
          background-color: #f0f3f94f;
          position: relative;
        }
        .container-repeatable-elements .controls {
            display: flex;
            align-content: flex-start;
            position: absolute;
            left: -1.4rem;
            z-index: 2;
            flex-flow: column;
            flex-wrap: wrap;
            width: fit-content;
        }

        .container-repeatable-elements .controls button {
            height: 1.5rem;
            width: 1.5rem;
            border-radius: 50%;
            margin-bottom: 2px;
            overflow: hidden;
            border-width: 0;
            opacity: 1;
            background: revert;
            -webkit-appearance: button;
            font-size: revert;
            color: revert;
            padding: revert;
        }
        
        .container-repeatable-elements .controls button.move-element-up,
        .container-repeatable-elements .controls button.move-element-down {
            margin: 2px auto;
        }
        .container-repeatable-elements .repeatable-element:first-of-type .move-element-up,
        .container-repeatable-elements .repeatable-element:last-of-type .move-element-down {
            display: none;
        }
      </style>
      @endBassetBlock
  @endpush

  {{-- FIELD EXTRA JS --}}
  {{-- push things in the after_scripts section --}}

  @push('crud_fields_scripts')
      @bassetBlock('backpack/pro/fields/repeatable-field.js')
      <script>
        /**
         * Takes all inputs in a repeatable element and makes them an object.
         */
        function repeatableElementToObj(element) {
            var obj = {};

            element.find('input, select, textarea').each(function () {
                if ($(this).data('repeatable-input-name')) {
                    obj[$(this).data('repeatable-input-name')] = $(this).val();
                }
            });

            return obj;
        }

        /**
         * The method that initializes the javascript on this field type.
         */
        function bpFieldInitRepeatableElement(element) {

            var field_name = element.attr('name');
            let escaped_field_name = $.escapeSelector(field_name);

            var container_holder = $('[data-repeatable-holder="'+escaped_field_name+'"]');

            var init_rows = Number(container_holder.attr('data-init-rows'));
            var min_rows = Number(container_holder.attr('data-min-rows'));
            var max_rows = Number(container_holder.attr('data-max-rows')) || Infinity;

            // make a copy of the group of inputs in their default state
            // this way we have a clean element we can clone when the user
            // wants to add a new group of inputs
            var container = $('[data-repeatable-identifier="'+escaped_field_name+'"]').last();

            // make sure the inputs get the data-repeatable-input-name
            // so we can know that they are inside repeatable
            container.find('input, select, textarea')
                    .each(function(){
                        var name_attr = getCleanNameArgFromInput($(this));
                        $(this).attr('data-repeatable-input-name', name_attr)
                    });

            var field_group_clone = container.clone();
            container.remove();

            element.parent().find('.add-repeatable-element-button').click(function(){
                newRepeatableElement(container_holder, field_group_clone);
            });

            $('input[type=hidden][name='+escaped_field_name+']').first().on('CrudField:disable', function() {
                disableRepeatableContainerFields(container_holder);
            });

            $('input[type=hidden][name='+escaped_field_name+']').first().on('CrudField:enable', function() {
                enableRepeatableContainerFields(container_holder);
            });

            var container_rows = container_holder.children().length;
            var add_entry_button = element.parent().find('.add-repeatable-element-button');
            if(container_rows === 0) {
                for(let i = 0; i < Math.min(init_rows, max_rows || init_rows); i++) {
                    container_rows++;
                    add_entry_button.trigger('click');
                }
            }

            setupRepeatableNamesOnInputs(container_holder);

            setupElementRowsNumbers(container_holder);

            setupElementCustomSelectors(container_holder);

            setupRepeatableDeleteRowButtons(container_holder);

            setupRepeatableReorderButtons(container_holder);

            updateRepeatableRowCount(container_holder);

            setupFieldCallbacksListener(container_holder);

            setupFieldCallbacks(container_holder);

            setupRepeatableChangeEvent(container_holder);
        }

        function disableRepeatableContainerFields(container) {
            switchRepeatableInputsDisableState(container, false);
            container.parent().parent().find('.add-repeatable-element-button').attr('disabled', 'disabled')
            container.children().each(function(i, row) {
                row = $(row)
                row.find('.delete-element').attr('disabled', 'disabled');
                row.find('.move-element-up, .move-element-down').attr('disabled', 'disabled');
            });
        }

        function enableRepeatableContainerFields(container) {
            switchRepeatableInputsDisableState(container);
            container.parent().parent().find('.add-repeatable-element-button').removeAttr('disabled');
            container.children().each(function(i, row) {
                row = $(row)
                row.find('.delete-element').removeAttr('disabled');
                row.find('.move-element-up, .move-element-down').removeAttr('disabled');
            });
        }

        function switchRepeatableInputsDisableState(container, enable = true) {
            let subfields = JSON.parse(container.attr('data-subfield-names'));
            let repeatableName = container.attr('data-repeatable-holder');
            container.children().each(function(i, el) {
                subfields.forEach(function(name) {
                    crud.field(repeatableName).subfield(name, i+1).enable(enable);
                });
            });
        }

        function setupRepeatableNamesOnInputs(container) {
            container.find('input, select, textarea')
                .each(function() {
                    if (typeof $(this).attr('data-repeatable-input-name') === 'undefined') {
                        var nameAttr = getCleanNameArgFromInput($(this));
                        if(nameAttr) {
                            $(this).attr('data-repeatable-input-name', nameAttr)
                        }
                    }
            });
        }

        /**
         * Adds a new field group to the repeatable input.
         */
        function newRepeatableElement(container_holder, field_group) {

            var new_field_group = field_group.clone();

            container_holder.append(new_field_group);

            // after appending to the container we reassure row numbers
            setupElementRowsNumbers(container_holder);

            // we also setup the custom selectors in the elements so we can use dependant functionality
            setupElementCustomSelectors(container_holder);

            setupRepeatableDeleteRowButtons(container_holder);

            setupRepeatableReorderButtons(container_holder);

            // updates the row count in repeatable and handle the buttons state
            updateRepeatableRowCount(container_holder);

            // re-index the array names for the fields
            updateRepeatableContainerNamesIndexes(container_holder);

            initializeFieldsWithJavascript(container_holder);

            setupFieldCallbacks(container_holder);

            setupRepeatableChangeEvent(container_holder);

            triggerRepeatableInputChangeEvent(container_holder);

            triggerFocusOnFirstInputField(getFirstFocusableField(new_field_group));
        }

        function setupRepeatableDeleteRowButtons(container) {
            container.children().each(function(i, repeatable_group) {
                setupRepeatableDeleteButtonEvent(repeatable_group);
            });
        }

        function setupRepeatableDeleteButtonEvent(repeatable_group) {
            let row = $(repeatable_group);
            let delete_button = row.find('.delete-element');

            // remove previous events on this button
            delete_button.off('click');

            delete_button.click(function(){
                let $repeatableElement = $(this).closest('.repeatable-element');
                let escapedRepeatableIdentifier = $.escapeSelector($repeatableElement.attr('data-repeatable-identifier'));
                let container = $('[data-repeatable-holder="'+escapedRepeatableIdentifier+'"]')

                row.find('input, select, textarea').each(function(i, el) {
                    // we trigger this event so fields can intercept when they are beeing deleted from the page
                    // implemented because of ckeditor instances that stayed around when deleted from page
                    // introducing unwanted js errors and high memory usage.
                    $(el).trigger('CrudField:delete');
                });

                $repeatableElement.remove();

                triggerRepeatableInputChangeEvent(container);

                // updates the row count and handle button state
                updateRepeatableRowCount(container);

                //we reassure row numbers on delete
                setupElementRowsNumbers(container);

                updateRepeatableContainerNamesIndexes(container);
            });
        }

        function setupRepeatableReorderButtons(container) {
            container.children().each(function(i, repeatable_group) {
                setupRepeatableReorderButtonEvent($(repeatable_group));
            });
        }

        function setupRepeatableReorderButtonEvent(repeatable_group) {
            let row = $(repeatable_group);
            let reorder_buttons = row.find('.move-element-up, .move-element-down');

            // remove previous events on this button
            reorder_buttons.off('click');

            reorder_buttons.click(function(e){
                let $repeatableElement = $(e.target).closest('.repeatable-element');
                let escapedRepeatableIdentifier = $.escapeSelector($repeatableElement.attr('data-repeatable-identifier'));
                let container = $('[data-repeatable-holder="'+escapedRepeatableIdentifier+'"]')

                // get existing values
                let elementIndex = positionIndex = $repeatableElement.index();

                positionIndex += $(this).is('.move-element-up') ? -1 : 1;

                if (positionIndex < 0) return;

                if($(this).is('.move-element-up')) {
                    container.children().eq(positionIndex).before($repeatableElement)
                }else{
                    container.children().eq(positionIndex).after($repeatableElement)
                }

                triggerRepeatableInputChangeEvent(container)

                // after appending to the container we reassure row numbers
                setupElementRowsNumbers(container);
                
                // re-index the array names for the fields
                updateRepeatableContainerNamesIndexes(container);

            });
        }

        // this function is responsible for managing rows numbers upon creation/deletion of elements
        function setupElementRowsNumbers(container) {
            var number_of_rows = 0;
            container.children().each(function(i, el) {
                var rowNumber = i+1;
                $(el).attr('data-row-number', rowNumber);
                //also attach the row number to all the input elements inside
                $(el).find('input, select, textarea').each(function(i, input) {
                    // only add the row number to inputs that have name, so they are going to be submitted in form
                    if($(input).attr('name')) {
                        $(input).attr('data-row-number', rowNumber);
                    }

                    if($(input).is('[data-reorder-input]')) {
                        $(input).val(rowNumber);
                    }
                });
                number_of_rows++;
            });

            container.attr('number-of-rows', number_of_rows);
        }

        // this function is responsible for adding custom selectors to repeatable inputs that are selects and could be used with
        // dependant fields functionality
        function setupElementCustomSelectors(container) {
            container.children().each(function(i, el) {
                // attach a custom selector to this elements
                $(el).find('select').each(function(i, select) {
                    let selector = '[data-repeatable-input-name="%DEPENDENCY%"][data-row-number="%ROW%"],[data-repeatable-input-name="%DEPENDENCY%[]"][data-row-number="%ROW%"]';
                    select.setAttribute('data-custom-selector', selector);
                });
            });
        }

        function updateRepeatableContainerNamesIndexes(container) {
            container.children().each(function(i, repeatable) {
                var index = $(repeatable).attr('data-row-number')-1;
                let repeatableName = $(repeatable).attr('data-repeatable-identifier');

                // updates the indexes in the array of repeatable inputs
                $(repeatable).find('input, select, textarea').each(function(i, el) {
                    if(typeof $(el).attr('data-row-number') !== 'undefined') {
                        let field_name = $(el).attr('data-repeatable-input-name') ?? $(el).attr('name') ?? $(el).parent().find('input[data-repeatable-input-name]').first().attr('data-repeatable-input-name');
                        let suffix = '';
                        // if there are more than one "[" character, that means we already have the repeatable name
                        // we need to parse that name to get the "actual" field name.
                        if(field_name.endsWith("[]")) {
                            suffix = "[]";
                            field_name = field_name.slice(0,-2);
                        }

                        if($(el).prop('multiple')) {
                            suffix = "[]";
                        }

                        if(field_name.split('[').length - 1 > 1) {
                            let field_name_position = field_name.lastIndexOf('[');
                            // field name will contain the closing "]" that's why the last slice.
                            field_name = field_name.substring(field_name_position + 1).slice(0,-1);
                        }

                        if(typeof $(el).attr('data-repeatable-input-name') === 'undefined') {
                            $(el).attr('data-repeatable-input-name', field_name);
                        }

                        $(el).attr('name', container.attr('data-repeatable-holder')+'['+index+']['+field_name+']'+suffix);
                    }
                });
            });

        }

        function triggerRepeatableInputChangeEvent(repeatable) {
            var values = [];
            repeatable.children().each(function(i, el) {
                values.push(repeatableElementToObj($(el)));
            });
            let escapedRepeatableIdentifier = $.escapeSelector(repeatable.attr('data-repeatable-holder'));
            $('input[type=hidden][name='+escapedRepeatableIdentifier+']').first().trigger('change', [values]);
        }

        function repeatableInputCallbacksEvent(event) {
            if(event.type === 'input') {
                event.target.setAttribute('callbacks-run', event.type);
            }
          
            if(event.target.getAttribute('callbacks-run') === 'input' && event.target.getAttribute('callbacks-run') !== event.type) {
                event.target.setAttribute('callbacks-run', false);
                return;
            }

            let rowNumber = event.target.getAttribute('data-row-number');
            let repeatableName = event.target.closest('.repeatable-element').getAttribute('data-repeatable-identifier');
            let name = event.target.getAttribute('data-repeatable-input-name');
            let subfield = crud.field(repeatableName).subfield(name, rowNumber);

            let fieldCallbacks = window.crud.subfieldsCallbacks[repeatableName] ?? false;

            if(!fieldCallbacks) {
                return;
            }

            fieldCallbacks
                .filter(callback =>
                    callback.field.name === name &&
                    callback.field.parent.name === repeatableName
                )
                .forEach((callback, callbackID) => {
                    callback.closure(subfield, event);
                });
        }

        function setupFieldCallbacks(container) {
            let subfields = JSON.parse(container.attr('data-subfield-names'));
            let repeatableName = container.attr('data-repeatable-holder');
            let fieldCallbacks = window.crud.subfieldsCallbacks[repeatableName] ?? false;
          
            if(!fieldCallbacks) {
                return;
            }

            let triggerChange = [];

            fieldCallbacks
                .filter(callback =>
                    callback.field.parent.name === repeatableName
                )
                .forEach((callback, callbackID) => {
                    if(callback.triggerChange) {
                        triggerChange.push(callback.field.name);
                    }
                });

            container.children().each(function(i, el) {
                subfields.forEach(function(name) {
                    let rowNumber = i + 1;                  
                    let subfield = crud.field(repeatableName).subfield(name, rowNumber);

                    if (subfield.$input.attr('callbacks-applied')) {
                        return;
                    }
                    
                    if(subfield.input && ['INPUT', 'TEXTAREA'].includes(subfield.input?.nodeName)) {
                        subfield.input.addEventListener('input', repeatableInputCallbacksEvent, false);
                        if(triggerChange.includes(name)) {
                            subfield.input.dispatchEvent(new Event('input'), { bubbles: false });
                        } 
                    }
                        
                    subfield.$input.change(repeatableInputCallbacksEvent);

                    if(triggerChange.includes(name)) {
                        subfield.$input.trigger('change');
                    }

                    subfield.$input.attr('callbacks-applied', true);
                });
            });


        }

        function setupFieldCallbacksListener(container) {
            container
                .closest('[bp-field-wrapper]')
                .on('CrudField:subfieldCallbacksUpdated', function(){
                    setupFieldCallbacks(container)
                });
        }

        function setupRepeatableChangeEvent(container) {
            let subfields = JSON.parse(container.attr('data-subfield-names'));
            let repeatableName = container.attr('data-repeatable-holder');
            container.children().each(function(i, el) {
                let rowNumber = i+1;
                subfields.forEach(function(name) {
                    let subfield = crud.field(repeatableName).subfield(name, rowNumber);
                    if(!subfield.input?.getAttribute('change-event-applied')) {
                        subfield.onChange(function(event) {
                                triggerRepeatableInputChangeEvent(container);
                        });
                        subfield.input?.setAttribute('change-event-applied', true);
                    }
                });
            });
        }

        // return the clean name from the input
        function getCleanNameArgFromInput(element) {
            if (element.data('repeatable-input-name')) {
                fieldName = element.data('repeatable-input-name');
            }
            if (element.data('name')) {
                fieldName = element.data('name');
            } else if (element.attr('name')) {
               fieldName = element.attr('name');
            }

            if(typeof fieldName === 'undefined') {
                return false;
            }

            // if there are more than one "[" character, that means we already have the repeatable name
            // we need to parse that name to get the "actual" field name.
            if(fieldName.endsWith("[]")) {
                fieldName = fieldName.slice(0,-2);
            }
            if(fieldName.split('[').length - 1 > 1) {
                let fieldName_position = fieldName.lastIndexOf('[');
                // field name will contain the closing "]" that's why the last slice.
                fieldName = fieldName.substring(fieldName_position + 1).slice(0,-1);
            }
            return fieldName;
        }

        // update the container current number of rows and work out the buttons state
        function updateRepeatableRowCount(container) {
            let max_rows = Number(container.attr('data-max-rows')) || Infinity;
            let min_rows = Number(container.attr('data-min-rows')) || 0;

            let current_rows =  container.children().length;

            // show or hide delete button
            container.find('.delete-element').toggleClass('d-none', current_rows <= min_rows);

            // show or hide move buttons
            container.find('.move-element-up, .move-element-down').toggleClass('d-none', current_rows <= 1);

            // show or hide new item button
            container.parent().parent().find('.add-repeatable-element-button').toggleClass('d-none', current_rows >= max_rows);

        }
    </script>
    @endBassetBlock
  @endpush
