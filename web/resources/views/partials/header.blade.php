<header>
    <div class="container-fluid header">
        <div class="header__logo-container">
            <a href="{{makeUrl()}}" title="{{config('settings.name')}}">
                <img src="{{asset(config('settings.logo'))}}" alt="{{config('settings.name')}}" title="{{config('settings.name')}}"  loading="lazy" />
            </a>
        </div>
        <x-navbar :$urlTranslateds/>
    </div>
</header>
