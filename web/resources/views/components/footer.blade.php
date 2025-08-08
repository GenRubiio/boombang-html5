<footer>
    <div class="container-1200">
        <div class="footer-container">
            <div class="footer-container__header">
                <div class="footer-container__left">
                    <div class="footer-container__left__title">
                        {{ trans('web.follow') }}
                    </div>
                    <x-header-social-networks />
                </div>
                <div class="footer-container__middle">
                    @foreach ($footerItems as $item)
                        <div class="footer-container__middle__item">
                            <a href="{{ $item->link }}" class="footer-container__middle__item__link">
                                {{ $item->name }}
                            </a>
                        </div>
                        /
                    @endforeach
                    <div class="footer-container__middle__item">
                        <a id="cookies-setting" class="footer-container__middle__item__link">
                            {{ trans('cookies.button_footer') }}
                        </a>
                    </div>
                </div>
                <div class="footer-container__right">
                    <a href="{{ makeUrl('Home') }}" title="{{ config('settings.name') }}">
                        <img src="{{ asset(config('settings.logo')) }}" alt="{{ config('settings.name') }}"
                            title="{{ config('settings.name') }}" loading="lazy" />
                    </a>
                </div>
            </div>
            <div class="footer-container__bottom">
                <div>
                    © BoomMania 2025 - {{ date('Y') }} {{ trans('web.copyright') }}
                </div>
            </div>
        </div>
    </div>
</footer>
