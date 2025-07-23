@if($entry->exists_blade)
    <a href="{{ makeUrl($entry->name) }}" target="_blank" class="btn btn-sm btn-link">
        <i class="las la-external-link-alt"></i> {{ trans('admin.go_to_page') }}
    </a>
@endif
