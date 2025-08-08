<div class="page-news__content__left__categories">
    <h2 class="page-news__content__left__categories-title">
        {{ trans('web.categories') }}
    </h2>
    <div class="page-news__content__left__categories-list">
        <button class="page-news__content__left__categories-item active">
            <span class="page-news__content__left__categories-item-text">{{ trans('web.all') }}</span>
        </button>
        @foreach ($blog_tags as $tag)
            <button class="page-news__content__left__categories-item">
                <span class="page-news__content__left__categories-item-text">{{ $tag->name }}</span>
            </button>
        @endforeach
    </div>
</div>
