<!doctype html>
<html lang="{{ LaravelLocalization::getCurrentLocale() }}">

<head>
    @php
        header('Content-Type: text/html');
        $urlTranslateds = isset($page) ? getUrlTranslateds($page, $pageSlug ?? $page->slug) : null;
    @endphp

    @include('partials.metas')

    @include('partials.scripts')

    <script defer type="text/javascript">
        @include('partials.viewconfig.head-scripts')
        @stack('head-scripts')
    </script>

    @include('partials.analytics')

    @include('partials.styles')

    @yield('head')

    @include('partials.metas-seo')

    @include('partials.favicon')
    @cookieconsentscripts
</head>

<body style="background-image: url('{{ asset('images/body_bg.png') }}');">
    @include('partials.body-analytics')
    <noscript>
        <div class="noscript">
            TODO trans file y clase en sass
            {{ trans('web.noscript') }}
        </div>
    </noscript>
    <div id="app">
        <main>
            @yield('content')
        </main>
    </div>

    @include('partials.layout-includes')
    @cookieconsentview
</body>

</html>
