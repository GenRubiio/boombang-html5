<div class="bheader__banner">
    <img src="{{ asset($header_image) }}" alt="Home Banner" class="img-fluid">
    <div class="bheader__banner-motto">
        <img src="{{ asset('images/home/motto-water.webp') }}" alt="Play Motto">
    </div>
    <div class="bheader__banner-content"
        style="background-image: url('{{ asset('images/home/play-background.svg') }}');">
        <div class="bheader__banner-content__button">
            <div>
                <div class="bheader__banner-content__button-avatar">
                    <img src="{{ asset($button_image) }}" alt="Avatar" class="img-fluid">
                </div>
                <div class="play-btn-container">
                    <div>
                        <a href="{{ makeUrl('Play') }}" class="play-btn open-popup">
                            Jugar
                        </a>
                    </div>
                    <x-header-social-networks />
                </div>
            </div>
        </div>
    </div>
</div>
<div class="white-separator"></div>
