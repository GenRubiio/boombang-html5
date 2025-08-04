<div class="page-news__content__left__news">
    @if (!empty($blog_articles))
        @foreach ($blog_articles as $post)
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
    @endif
</div>
