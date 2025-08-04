<div class="container-1200">
    <div class="page-security__content">
        <div class="page-security__content__left">
            <div class="page-security__content__left-title">
                {!! $title !!}
            </div>
            <div class="page-security__content__left__items">
                @foreach ($sections as $section)
                    <div class="page-security__content__left__items__item">
                        <div class="page-security__content__left__items__item-title">
                            {{ $section->title }}
                        </div>
                        <div class="page-security__content__left__items__item__content">
                            <div class="page-security__content__left__items__item__content-text">
                                {!! $section->text !!}
                            </div>
                            @if ($section->image)
                                <div class="page-security__content__left__items__item__content-image">
                                    <img src="{{ $section->image }}" alt="{{ $section->title }}">
                                </div>
                            @endif
                        </div>
                    </div>
                    @if ($loop->iteration < count((array)$sections))
                        <hr>
                    @endif
                @endforeach
            </div>
        </div>
        <div class="page-security__content__right">

        </div>
    </div>
</div>
