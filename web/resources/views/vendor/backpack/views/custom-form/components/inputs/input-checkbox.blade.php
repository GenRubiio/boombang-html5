<div class="form-group input-group-sm">
    @foreach ($currentInput['options'] as $option)
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="{{ getTextTrans($option['value']) }}"
                {{ $option['default'] ? 'checked="checked"' : '' }}>
            <label class="form-check-label">{{ getTextTrans($option['value']) }}</label>
        </div>
    @endforeach
</div>
