<div class="page-news__content__left__news">
    @if (!empty($blog_articles))
        @foreach ($blog_articles as $post)
            <div class="news-item">
                <div class="news-item__left">
                    <a href="{{ makeUrl('News', $post->slug) }}"><img src="{{ asset($post->image) }}"
                            alt="{{ $post->title }}">
                </div>
                <div class="news-item__right">
                    <h3 class="news-item__right-title">
                        <a href="{{ makeUrl('News', $post->slug) }}">{{ $post->title }}</a>
                    </h3>
                    <div class="news-item__right-info">
                        <a href="{{ makeUrl('News', $post->slug) }}"><em><span>{{ $post->parsed_date }}</span></em></a>
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
    @endif
</div>
