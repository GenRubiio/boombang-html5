<div class="footer__items-container">
    @if($footerItems->isNotEmpty())
        <ul class="footer__items-links-list">
            @foreach($footerItems as $footerItem)
                <li class="footer__items-list-item">
                    <a href="{{$footerItem->link}}" class="footer__items-link">
                        {{$footerItem->name}}
                    </a>
                </li>
            @endforeach
        </ul>
    @endif
</div>
