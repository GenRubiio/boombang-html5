<div class="container-1200">
    <div class="page-home__content">
        <div class="page-home__content__left">
            <div class="page-home__content__left-title">
                {!! $title !!}
            </div>
            @include('partials.pages.home.news',[
                'blog_featured' => $blog_featured ?? null,
            ])
        </div>
        <div class="page-home__content__right">

        </div>
    </div>
</div>
