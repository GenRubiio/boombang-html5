<aside id="cookies-policy" class="cookies cookies--no-js" data-text="{{ json_encode(__('cookies.details')) }}">
    <div class="cookies__alert">
        <div class="cookies__container">
            <div class="cookies__wrapper">
                <h2 class="cookies__title">@lang('cookies.title')</h2>
                <div class="cookies__intro">
                    <p>@lang('cookies.intro')</p>
                    <p>@lang('cookies.link', ['url' => makeUrl('Cookies')])</p>
                </div>
                <div class="cookies__actions">
                    <div style="display: none;">
                        @cookieconsentbutton(action: 'accept.essentials', label: __('cookies.essentials'), attributes: ['class' => 'cookiesBtn cookiesBtn--essentials'])
                    </div>
                    @cookieconsentbutton(action: 'accept.all', label: __('cookies.all'), attributes: ['class' => 'cookiesBtn cookiesBtn--accept'])
                </div>
            </div>
        </div>
        <a href="#cookies-policy-customize" class="cookies__btn cookies__btn--customize">
            <span>@lang('cookies.customize')</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true">
                <path
                    d="M14.7559 11.9782C15.0814 11.6527 15.0814 11.1251 14.7559 10.7996L10.5893 6.63297C10.433 6.47669 10.221 6.3889 10 6.38889C9.77899 6.38889 9.56703 6.47669 9.41075 6.63297L5.24408 10.7996C4.91864 11.1251 4.91864 11.6527 5.24408 11.9782C5.56951 12.3036 6.09715 12.3036 6.42259 11.9782L10 8.40074L13.5774 11.9782C13.9028 12.3036 14.4305 12.3036 14.7559 11.9782Z"
                    fill="#2C2E30" />
            </svg>
        </a>
        <div class="cookies__expandable cookies__expandable--custom" id="cookies-policy-customize">
            <form action="{{ route('cookieconsent.accept.configuration') }}" method="post" class="cookies__customize">
                @csrf
                <div class="cookies__sections">
                    @foreach ($cookies->getCategories() as $category)
                        <div class="cookies__section">
                            <label for="cookies-policy-check-{{ $category->key() }}" class="cookies__category">
                                @if ($category->key() === 'essentials')
                                    <input type="hidden" name="categories[]" value="{{ $category->key() }}" />
                                    <input type="checkbox" name="categories[]" value="{{ $category->key() }}"
                                        id="cookies-policy-check-{{ $category->key() }}" checked="checked"
                                        disabled="disabled" />
                                @else
                                    <input type="checkbox" name="categories[]" value="{{ $category->key() }}"
                                        id="cookies-policy-check-{{ $category->key() }}" />
                                @endif
                                <span class="cookies__box">
                                    <strong class="cookies__label">{{ $category->title }}</strong>
                                </span>
                                @if ($category->description)
                                    <p class="cookies__info">{{ $category->description }}</p>
                                @endif
                            </label>

                            <div class="cookies__expandable" id="cookies-policy-{{ $category->key() }}">
                                <ul class="cookies__definitions">
                                    @foreach ($category->getCookies() as $cookie)
                                        <li class="cookies__cookie">
                                            <p class="cookies__name">{{ $cookie->name }}</p>
                                            <p class="cookies__duration">
                                                {{ \Carbon\CarbonInterval::minutes($cookie->duration)->cascade() }}</p>
                                            @if ($cookie->description)
                                                <p class="cookies__description">{{ $cookie->description }}</p>
                                            @endif
                                        </li>
                                    @endforeach
                                </ul>
                            </div>
                            <a href="#cookies-policy-{{ $category->key() }}"
                                class="cookies__details">@lang('cookies.details.more')</a>
                        </div>
                    @endforeach
                </div>
                <div class="cookies__save">
                    <div>
                        <button type="submit" class="cookiesBtn__link">@lang('cookies.save')</button>
                    </div>
                    <div>
                        @cookieconsentbutton(action: 'accept.all', label: __('cookies.all'), attributes: ['class' => 'cookiesBtn cookiesBtn--accept'])
                    </div>
                </div>
            </form>
        </div>
    </div>
</aside>

{{-- STYLES & SCRIPT : feel free to remove them and add your own --}}

<script data-cookie-consent>
    {!! file_get_contents(LCC_ROOT . '/dist/script.js') !!}
</script>

<style data-cookie-consent>
    {!! file_get_contents(LCC_ROOT . '/dist/style.css') !!} #cookies-policy .cookiesBtn__link {
        background: #000000;
        border: 1px solid #000000;
        border-radius: 4px;
        color: #fff;
        cursor: pointer;
        display: block;
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        line-height: 1em;
        margin: 0;
        overflow: hidden;
        padding: .86em 1em;
        text-align: center;
        text-decoration: none;
        text-overflow: ellipsis;
        transition: opacity .2s ease-out;
        white-space: nowrap;
        width: 100%;
    }

    #cookies-policy .cookies__intro a {
        color: #ab2609;
        text-decoration: underline;
        transition: color .2s ease-out;
    }

    #cookies-policy .cookies__category input:checked+.cookies__box:after {
        background: #000000;
        opacity: 1;
    }

    #cookies-policy .cookies__details {
        color: #ab2609;
        display: block;
        font-size: .875em;
        margin: .625em 0 .9em;
        transition: color .2s ease-out;
    }

    #cookies-policy .cookies__intro a:focus,
    #cookies-policy .cookies__intro a:hover {
        color: #ab2609;
    }

    #cookies-policy .cookies__details:focus,
    #cookies-policy .cookies__details:hover {
        color: #ab2609;
    }

    #cookies-policy .cookies__save {
        flex-direction: column;
        gap: 5px
    }

    #cookies-policy .cookies__category input:disabled+.cookies__box:after {
        background: #747272;
        opacity: 1;
    }
</style>
