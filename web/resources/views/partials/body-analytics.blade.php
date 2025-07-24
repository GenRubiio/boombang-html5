<!-- Analytics -->
@yield('body-analytics')
@if(App::environment() === 'production' && \Whitecube\LaravelCookieConsent\Facades\Cookies::hasConsentFor('analytics'))
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ config('cookieconsent.google_analytics.gtm_id') }}"
                      height="0" width="0" style="display:none;visibility:hidden"
                      title="Google Tag Manager noscript fallback"></iframe>
    </noscript>
    <!-- End Google Tag Manager (noscript) -->
@endif
