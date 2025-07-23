@if ($crud->hasAccess('create'))
    <a href="{{ url($crud->route.'/create?version=major') }}" class="btn btn-primary" data-style="zoom-in"><span class="ladda-label"><i class="la la-plus"></i> {{ trans('backpack::crud.add') }} major version</span></a>
@endif
