<!-- Metas básicas -->
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>@yield('title', config('app.name'))</title>
<meta name="description" content="@yield('meta-description', '')">

{{-- Canonical (puedes sobreescribir con @section('meta-rel-canonical')) --}}
<link rel="canonical" href="@yield('meta-rel-canonical', LaravelLocalization::getLocalizedURL(LaravelLocalization::getCurrentLocale(), null, [], true))" />

{{-- Alternates (incluye el idioma actual = self-referencing) --}}
@php
    $supportedLocales = LaravelLocalization::getSupportedLocales();
@endphp
@foreach ($supportedLocales as $locale => $language)
    <link rel="alternate" hreflang="{{ $locale }}"
        href="{{ LaravelLocalization::getLocalizedURL($locale, null, [], true) }}" />
@endforeach

{{-- x-default recomienda Google (apunta a tu fallback) --}}
<link rel="alternate" hreflang="x-default"
    href="{{ LaravelLocalization::getLocalizedURL(config('app.fallback_locale'), null, [], true) }}" />
