<div class="container-1200">
    <div class="page-news__content">
        <div class="page-news__content__left">
            <div class="page-news__content__left-title">
                {!! $title !!}
            </div>
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
