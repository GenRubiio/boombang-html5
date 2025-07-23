<div class="mb-2 text-right d-none" id="modal-change-lang_unput_modal" data-lang="{{ app()->getLocale() }}" data-default-lang="{{ app()->getLocale() }}">
    <div class="btn-group">
        <button type="button" class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
            aria-expanded="false">
            {{ trans('backpack::crud.language') }}:
            <span class="current-language_input_modal">
                {{ config('backpack.crud.locales')[request()->input('_locale') ? request()->input('_locale') : App::getLocale()] }}
            </span>
            &nbsp; <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
            @foreach (config('backpack.crud.locales') as $key => $locale)
                <button class="dropdown-item language_input_modal-option_button" data-local="{{ $key }}"
                    data-lang-name="{{ $locale }}">{{ $locale }}</button>
            @endforeach
        </ul>
    </div>
</div>
