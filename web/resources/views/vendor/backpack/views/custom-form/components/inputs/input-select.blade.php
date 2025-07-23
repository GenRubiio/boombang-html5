<select class="form-control">
    @foreach ($currentInput['options'] as $option)
        <option {{ $option['default'] ? 'selected="selected"' : '' }}>
            {{ getTextTrans($option['value']) }}
        </option>
    @endforeach
</select>