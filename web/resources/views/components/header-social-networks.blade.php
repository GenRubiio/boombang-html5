<div class="social-links">
    @foreach($socialNetworks as $network)
        <a href="{{ $network->link }}" target="_blank" class="social-link tooltip"
           style="background-color: {{ $network->background_color }};">
            <i class="{{ $network->icon }}"></i>
            <span class="tooltiptext">{{ $network->name }}</span>
        </a>
    @endforeach
</div>
