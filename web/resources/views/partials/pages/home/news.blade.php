@if (!empty($blog_featured))
    <div class="page-home__content__left__fixed">
        <div class="item" style="background-image: url({{ asset($blog_featured->image) }});">
            <div class="item__container">
                <div class="item__container-content">
                    <h3 class="item__container-content__title">
                        <a href="{{ makeUrl('News', $blog_featured->slug) }}">{{ $blog_featured->title }}</a>
                    </h3>
                    <div class="item__container-content__info">
                        <a
                            href="{{ makeUrl('News', $blog_featured->slug) }}"><em><span>{{ $blog_featured->parsed_date }}</span></em></a>
                        / @foreach ($blog_featured->blogTags as $tag)
                            <a href="#"><em>{{ $tag->name }}</em></a>
                            @if (!$loop->last)
                                ,
                            @endif
                        @endforeach
                    </div>
                    <div class="item__container-content__description">
                        <a href="{{ makeUrl('News', $blog_featured->slug) }}">{!! $blog_featured->extract !!}</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endif
@if (!empty($blog_posts))
    <div class="page-home__content__left__news">
        @foreach ($blog_posts as $post)
            <div class="news-item">
                <div class="news-item__left">
                    <a href="{{ makeUrl('News', $post->slug) }}"><img src="{{ asset($post->image) }}"
                            alt="{{ $post->title }}"></a>
                </div>
                <div class="news-item__right">
                    <h3 class="news-item__right-title">
                        <a href="{{ makeUrl('News', $post->slug) }}">{{ $post->title }}</a>
                    </h3>
                    <div class="news-item__right-info">
                        <a
                            href="{{ makeUrl('News', $post->slug) }}"><em><span>{{ $post->parsed_date }}</span></em></a>
                        / @foreach ($post->blogTags as $tag)
                            <a href="#"><em>{{ $tag->name }}</em></a>
                            @if (!$loop->last)
                                ,
                            @endif
                        @endforeach
                    </div>
                    <div class="news-item__right-description">
                        <a href="{{ makeUrl('News', $post->slug) }}">{!! $post->extract !!}</a>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@endif
<div class="page-home__content__left__show-more">
    <a href="{{ makeUrl('News') }}">Más noticias <i class="fa-solid fa-angles-right"></i></a>
</div>
