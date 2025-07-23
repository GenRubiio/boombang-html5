@if($footerLegal->isNotEmpty())
    <ul class="footer__legal-list">
        @foreach($footerLegal as $footerLegalItem)
            <li class="footer__legal-list-item">
                <a href="{{$footerLegalItem->link}}" class="footer__legal-link">
                    {{$footerLegalItem->name}}
                </a>
            </li>
        @endforeach
        <li class="footer__legal-list-item footer__legal-copyright">
            &copy; {{date('Y')}} {{trans('web.copyright')}}
        </li>
    </ul>
@endif
