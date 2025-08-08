<div class="bheader__banner">
    <img src="{{ asset($header_image) }}" alt="{{ trans('web.banner_home') }}" class="img-fluid">
    <div class="bheader__banner-motto">
        <img src="{{ asset('images/home/motto-water.webp') }}" alt="{{ trans('web.play') }}">
    </div>
    <div class="bheader__banner-content"
        style="background-image: url('{{ asset('images/home/play-background.svg') }}');">
        <div class="bheader__banner-content__button">
            <div>
                <div class="bheader__banner-content__button-avatar">
                    <img src="{{ asset($button_image) }}" alt="{{ trans('web.avatar') }}" class="img-fluid">
                </div>
                <div class="play-btn-container">
                    <div>
                        <a href="{{ makeUrl('Play') }}" class="play-btn open-popup">
                            {{ trans('web.play') }}
                        </a>
                    </div>
                    <x-header-social-networks />
                </div>
            </div>
        </div>
    </div>
</div>
<div class="white-separator"></div>
