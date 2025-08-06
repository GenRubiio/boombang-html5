<div class="container-1200">
    <div class="page-home__content">
        <div class="page-home__content__left">
            <h1 class="page-home__content__left-title loading-text">
                {!! $title !!}
            </h1>
            @include('partials.pages.home.news', [
                'blog_featured' => $blog_featured ?? null,
            ])
        </div>
        <div class="page-home__content__right">

        </div>
    </div>
</div>
