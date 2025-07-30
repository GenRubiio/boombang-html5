<div class="language-dropdown">
    @if(count($languages) > 1)
        <span class="language-dropdown__current">{{$currentLocale}}</span>
        <div class="language-dropdown__container">
            @foreach($languages as $locale => $language)
                @if($locale != $currentLocale)
                    <a class="language-dropdown__item" href="{{$urlTranslateds[$locale] ?? "#"}}">{{$language['native']}}</a>
                @endif
            @endforeach
        </div>
    @else
        <span class="language-dropdown__current-only">{{$currentLocale}}</span>
    @endif
</div>
