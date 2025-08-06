<div class="container-1200">
    <div class="page-news__content">
        <div class="page-news__content__left">
            <h1 class="page-news__content__left-title loading-text">
                {!! $title !!}
            </h1>
            @include('partials.pages.news.categories', [
                'blog_tags' => $blog_tags ?? [],
            ])
            @include('partials.pages.news.news', [
                'blog_articles' => $blog_articles ?? [],
            ])
        </div>
        <div class="page-news__content__right">

        </div>
    </div>
</div>
