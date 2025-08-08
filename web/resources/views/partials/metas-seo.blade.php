        @if (!App::environment('production'))
            <meta name="robots" content="noindex" />
        @endif
        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <!-- Clasic metadata -->
        <meta name="title" content="@yield('meta-title')">
        <meta name="description" content="@yield('meta-description', config('settings.description'))">
        <meta name="keywords" content="@yield('meta-keywords')" />
        <meta name="author" content="@yield('meta-author', config('settings.name'))" />
        <meta name="channel" content="website" />
        <meta name="generator" content="BoomMania" />
        <!-- ./Clasic metadata -->
        <!-- Geo Metas -->
        @if (!is_null(config('settings.geo_position')))
            <meta name="geo.position" content="{{ config('settings.geo_position') }}" />
        @endif
        @if (!is_null(config('settings.geo_placename')))
            <meta name="geo.placename" content="{{ config('settings.geo_placename') }}" />
        @endif
        @if (!is_null(config('settings.geo_region')))
            <meta name="geo.region" content="{{ config('settings.geo_region') }}" />
        @endif
        @if (!is_null(config('settings.geo_icbm')))
            <meta name="ICBM" content="{{ config('settings.geo_icbm') }}" />
        @endif
        <!-- ./Geo Metas -->
        <!-- Open Graph metadata -->
        <meta property="og:title" content="@yield('og-title')" />
        <meta property="og:description" content="@yield('og-description', config('settings.description'))" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="{{ LaravelLocalization::getCurrentLocaleRegional() }}" />
        <meta property="og:url" content="{{ url()->current() }}" />
        <meta property="og:site_name" content="{{ config('settings.name') }}" />
        <meta property="og:image" content="@yield('og-image', config('settings.logo') != '' ? asset(config('settings.logo')) : '')" />
        <!-- ./Open Graph metadata -->
        <!-- Twitter metadata -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:creator"
            content="{{ (substr(config('settings.name'), 0, 1) !== '@' ? '@' : '') . config('settings.name') }}">
        <meta name="twitter:site" content="{{ config('settings.name') }}">
        <meta name="twitter:title" content="@yield('tw-title')">
        <meta name="twitter:description" content="@yield('tw-description', config('settings.description'))">
        <meta name="twitter:image" content="@yield('tw-image', config('settings.logo') != '' ? asset(config('settings.logo')) : '')" />
        <meta name="twitter:url" content="{{ url()->current() }}">
        <!-- ./Twitter metadata -->
        <!-- Other metadata -->
        @yield('other-metas')
        <!-- ./Other metadata -->
        @php
            $appUrl = rtrim(config('app.url'), '/');
            $siteName = config('settings.name', config('app.name'));
            $logoPath = config('settings.logo') ?: 'images/og-default.jpg';

            $graph = [
                [
                    '@type' => 'Organization',
                    '@id' => "{$appUrl}/#org",
                    'name' => $siteName,
                    'url' => $appUrl,
                    'logo' => [
                        '@type' => 'ImageObject',
                        'url' => asset($logoPath),
                    ],
                ],
                [
                    '@type' => 'WebSite',
                    '@id' => "{$appUrl}/#website",
                    'url' => $appUrl,
                    'name' => $siteName,
                    'publisher' => ['@id' => "{$appUrl}/#org"],
                    'inLanguage' => LaravelLocalization::getCurrentLocaleRegional(),
                    'potentialAction' => [
                        '@type' => 'SearchAction',
                        'target' => url('/search') . '?q={search_term_string}',
                        'query-input' => 'required name=search_term_string',
                    ],
                ],
            ];

            $schema = [
                '@context' => 'https://schema.org',
                '@graph' => $graph,
            ];
        @endphp

        <script type="application/ld+json">@json($schema, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT)</script>
        @yield('structured-data')
