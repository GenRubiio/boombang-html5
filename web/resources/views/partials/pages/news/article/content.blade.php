<div class="container-1200">
    <div class="page-article__content">
        <div class="page-article__content__left">
            <h1 class="page-article__content__left-title loading-text">
                {{ $article->title }}
            </h1>
            <div class="page-article__content__left-date">
                {{ $article->parsed_date }}
            </div>
            <hr>
            <div class="page-article__content__left-image">
                <img src="{{ asset($article->image) }}" alt="{{ $article->title }}">
            </div>
            <div class="page-article__content__left-content">
                {!! $article->content !!}
            </div>
            <div class="page-article__content__left__show-more">
                <a href="{{ makeUrl('News') }}">Más noticias <i class="fa-solid fa-angles-right"></i></a>
            </div>
        </div>
        <div class="page-article__content__right">

        </div>
    </div>
</div>
