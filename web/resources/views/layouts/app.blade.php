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
</head>

<body style="background-image: url('{{ asset('images/body_bg.png') }}');">
    <noscript>
        <div class="noscript">
            TODO trans file y clase en sass
            {{ trans('web.noscript') }}
        </div>
    </noscript>
    <div id="app">
        @include('partials.header')

        <main>
            @yield('content')
        </main>

        @include('partials.footer')
    </div>

    @include('partials.layout-includes')
</body>

</html>
