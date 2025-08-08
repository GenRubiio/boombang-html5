<div class="footer__social-networks-container">
    <ul class="footer__social-networks-list">
        @foreach($socialNetworks as $socialNetwork)
            <li class="footer__social-networks-list-item">
                <a href="{{$socialNetwork->link}}" target="_blank" rel="noopener" aria-label="{{$socialNetwork->name}}">
                    {!! injectSvg($socialNetwork->image, $socialNetwork->name, $socialNetwork->name) !!}
                </a>
            </li>
        @endforeach
    </ul>
</div>
