<nav>
    <div class="navbar-curtain"></div>
    <div class="navbar">
        @if (!$menu->isEmpty())
            <ul class="navbar__menu-container">
                @foreach ($menu as $item)
                    <li class="navbar__menu-item">
                        @php
                            $isActive = false;
                            $pageLink = rtrim($item->page_link, '/');
                            if ($pageLink == request()->url()) {
                                $isActive = true;
                            }
                        @endphp
                        <a href="{{ $item->page_link }}" class="navbar__menu-link {{ $isActive ? 'active' : '' }}">
                            @if (isset($item->image) && $item->image)
                                <span class="navbar__menu-image">
                                    <img src="{{ asset($item->image) }}" alt="{{ $item->name }}">
                                </span>
                            @endif
                            {{ $item->name }}
                        </a>
                    </li>
                @endforeach
            </ul>
        @endif
        <div class="navbar__language-selector-container">
            <x-language-selector :$urlTranslateds />
        </div>
    </div>
    <button class="hamburger hamburger--squeeze" type="button" tabindex="0" aria-label="Menu"
        aria-controls="navigation">
        <span class="hamburger-box">
            <span class="hamburger-inner"></span>
        </span>
    </button>
</nav>
