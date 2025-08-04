@if (!empty($blog_featured))
    <div class="page-home__content__left__fixed">
        <div class="item" style="background-image: url({{ asset($blog_featured->image) }});">
            <div class="item__container">
                <div class="item__container-content">
                    <div class="item__container-content__title">
                        {{ $blog_featured->title }}
                    </div>
                    <div class="item__container-content__info">
                        <em><span>{{ $blog_featured->parsed_date }}</span></em> / @foreach ($blog_featured->blogTags as $tag)
                            <a href="#"><em>{{ $tag->name }}</em></a>
                            @if (!$loop->last)
                                ,
                            @endif
                        @endforeach
                    </div>
                    <div class="item__container-content__description">
                        {!! $blog_featured->extract !!}
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
                    <img src="{{ asset($post->image) }}" alt="{{ $post->title }}">
                </div>
                <div class="news-item__right">
                    <div class="news-item__right-title">
                        {{ $post->title }}
                    </div>
                    <div class="news-item__right-info">
                        <em><span>{{ $post->parsed_date }}</span></em> / @foreach ($post->blogTags as $tag)
                            <a href="#"><em>{{ $tag->name }}</em></a>
                            @if (!$loop->last)
                                ,
                            @endif
                        @endforeach
                    </div>
                    <div class="news-item__right-description">
                        {!! $post->extract !!}
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@endif
<div class="page-home__content__left__show-more">
    <a href="{{ makeUrl('News') }}">Más noticias <i class="fa-solid fa-angles-right"></i></a>
</div>
