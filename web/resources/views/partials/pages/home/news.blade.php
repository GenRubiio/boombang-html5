<div class="page-home__content__left__fixed">
    <div class="item" style="background-image: url('https://picsum.photos/400/300');">
        <div class="item__container">
            <div class="item__container-content">
                <div class="item__container-content__title">Título destacado</div>
                <div class="item__container-content__info">
                    <em><span>{{ now()->subDays(1)->format('d M Y') }}</span></em> / <a href="#"><em>Campañas y
                            Actividades</em></a>, <a href="#"><em>Actividades</em></a>
                </div>
                <div class="item__container-content__description">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                </div>
            </div>
        </div>
    </div>
</div>
<div class="page-home__content__left__news">
    @for ($i = 0; $i < 5; $i++)
        <div class="news-item">
            <div class="news-item__left">
                <img src="https://picsum.photos/400/300" alt="News Image {{ $i + 1 }}">
            </div>
            <div class="news-item__right">
                <div class="news-item__right-title">
                    Título de la noticia {{ $i + 1 }}
                </div>
                <div class="news-item__right-info">
                    <em><span>{{ now()->subDays($i)->format('d M Y') }}</span></em> / <a href="#"><em>Campañas y
                            Actividades</em></a>, <a href="#"><em>Actividades</em></a>
                </div>
                <div class="news-item__right-description">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et
                    dolore magna aliqua.
                </div>
            </div>
        </div>
    @endfor
</div>
<div class="page-home__content__left__show-more">
    <a href="{{ makeUrl('News') }}">Más noticias <i class="fa-solid fa-angles-right"></i></a>
</div>
