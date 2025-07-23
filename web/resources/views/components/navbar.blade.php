<nav>
    <div class="navbar-curtain"></div>
    <div class="navbar">
        @if (!$menu->isEmpty())
            <ul class="navbar__menu-container">
                @foreach ($menu as $item)
                    <li class="navbar__menu-item">
                        <a href="{{ $item->page_link }}" class="navbar__menu-link">
                            {{ $item->name }}
                        </a>
                    </li>
                @endforeach
            </ul>
        @endif
    </div>
    <button class="hamburger hamburger--squeeze" type="button" tabindex="0" aria-label="Menu"
            aria-controls="navigation">
        <span class="hamburger-box">
            <span class="hamburger-inner"></span>
        </span>
    </button>
    {{--
    <div class="navbar__language-selector-container">
        <x-language-selector :$urlTranslateds/>
    </div>
    <div class="navbar__logout-container">
        <x-logout />
    </div>
    --}}
</nav>
