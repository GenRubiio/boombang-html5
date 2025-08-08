<!-- Metas -->
        <meta charset="UTF-8">
        @foreach(LaravelLocalization::getSupportedLocales() as $locale => $language)
            @if($locale == LaravelLocalization::getCurrentLocale())
                <meta http-equiv="content-language" content="{{ LaravelLocalization::getCurrentLocale() }}"/>
            @else
                <link href="{{ $urlTranslateds[$locale] ?? "#" }}" hreflang="{{ $locale }}" rel="alternate" type="text/html"/>
            @endif
        @endforeach

        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title')</title>

        <link rel="canonical" href="@yield('meta-rel-canonical', url()->current())"/>
