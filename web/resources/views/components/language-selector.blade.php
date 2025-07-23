<div class="language-dropdown">
    <span class="language-dropdown__current">{{$currentLocale}}</span>
    {{-- $languages[$currentLocale]['native'] --}}
    <div class="language-dropdown__container">
        @foreach($languages as $locale => $language)
            @if($locale != $currentLocale)
                <a class="language-dropdown__item" href="{{$urlTranslateds[$locale] ?? "#"}}">{{$language['native']}}</a>
            @endif
        @endforeach
    </div>
</div>
