@if ($crud->hasAccess('create'))
    <a href="{{ url($crud->route.'/create?version=patch') }}" class="btn btn-primary" data-style="zoom-in"><span class="ladda-label"><i class="la la-plus"></i> {{ trans('backpack::crud.add') }} patch version</span></a>
@endif
