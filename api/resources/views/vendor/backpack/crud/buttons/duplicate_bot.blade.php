@if ($entry->is_bot && $crud->hasAccess('duplicate'))
    <a href="{{ url($crud->route.'/'.$entry->getKey().'/duplicate') }}" 
       class="btn btn-sm btn-link" 
       title="Duplicate bot user"
       onclick="return confirm('Are you sure you want to duplicate this bot user?')">
        <i class="la la-copy"></i> Duplicate
    </a>
@endif