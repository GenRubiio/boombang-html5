<!doctype html>
<html lang="{{ LaravelLocalization::getCurrentLocale() }}" id="layout-auth">
<head>
    @php
        header('Content-Type: text/html');
        $urlTranslateds = (isset($page) && isset($pageSlug) ? getUrlTranslateds($page, $pageSlug) : null);
    @endphp

    @include('partials.analytics')

    @include('partials.metas')

    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    @include('partials.favicon')

    @include('partials.styles')

    @yield('head')

    <script type="text/javascript">
        @include('partials.viewconfig.head-scripts')
        @stack('head-scripts')
    </script>

    {{--@livewireStyles--}}
</head>
<body id="body-auth">
<div id="auth">
    <main>
        @yield('content')
    </main>
</div>

@include('partials.layout-includes')

@include('partials.scripts')

{{--@livewireScripts--}}
</body>
</html>
