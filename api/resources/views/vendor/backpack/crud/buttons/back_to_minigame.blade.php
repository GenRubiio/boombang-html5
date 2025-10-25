@if ($crud->hasAccess('list'))
    @php
        $minigameId = request()->get('minigame_id') ?? ($entry->minigame->id ?? null);
    @endphp
    @if ($minigameId)
        <a href="{{ backpack_url('minigame') }}/{{ $minigameId }}" class="btn btn-sm btn-link" title="Back to minigame">
            <i class="la la-arrow-left"></i> Back to minigame
        </a>
    @endif
@endif
