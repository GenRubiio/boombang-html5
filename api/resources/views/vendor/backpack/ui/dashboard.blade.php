@extends(backpack_view('blank'))

@php
    $defaultBreadcrumbs = [
      trans('backpack::crud.admin') => url(config('backpack.base.route_prefix'), 'dashboard'),
      trans('backpack::base.dashboard') => false,
    ];

    // if breadcrumbs aren't defined in the CrudController, use the default breadcrumbs
    $breadcrumbs = $breadcrumbs ?? $defaultBreadcrumbs;
@endphp

@section('content')
    <div class="row">
        <div class="col-sm-6 col-lg-3">
            <div class="card text-white bg-primary">
                <div class="card-body">
                    <div class="text-value-lg">{{ \App\Models\User::count() }}</div>
                    <div>Usuarios Registrados</div>
                    <div class="progress progress-white progress-xs">
                        <div class="progress-bar" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            </div>
        </div>

        @if(\Illuminate\Support\Facades\Schema::hasTable('public_scenes'))
        <div class="col-sm-6 col-lg-3">
            <div class="card text-white bg-info">
                <div class="card-body">
                    <div class="text-value-lg">{{ \App\Models\PublicScene::count() }}</div>
                    <div>Escenas Públicas</div>
                    <div class="progress progress-white progress-xs">
                        <div class="progress-bar" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            </div>
        </div>
        @endif

        @if(\Illuminate\Support\Facades\Schema::hasTable('catalog_items'))
        <div class="col-sm-6 col-lg-3">
            <div class="card text-white bg-success">
                <div class="card-body">
                    <div class="text-value-lg">{{ \App\Models\CatalogItem::count() }}</div>
                    <div>Items del Catálogo</div>
                    <div class="progress progress-white progress-xs">
                        <div class="progress-bar" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            </div>
        </div>
        @endif

        <!-- Widget de Gestión del Servidor -->
        <div class="col-sm-6 col-lg-3">
            <div class="card text-white bg-warning">
                <div class="card-body">
                    <div class="text-value-lg">
                        <i class="la la-server" style="font-size: 2em;"></i>
                    </div>
                    <div>Gestión del Servidor</div>
                    <div class="progress progress-white progress-xs">
                        <div class="progress-bar" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <div class="mt-2">
                        <a href="{{ backpack_url('server-management') }}" class="btn btn-sm btn-outline-light">
                            <i class="la la-cogs"></i> Acceder
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fa fa-info-circle"></i> Accesos Rápidos
                    </h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <a href="{{ backpack_url('server-management') }}" class="btn btn-warning btn-block btn-lg mb-2">
                                <i class="la la-server"></i> Gestión del Servidor
                            </a>
                            <small class="text-muted">Reiniciar el servidor Docker Node.js</small>
                        </div>
                        <div class="col-md-4">
                            <a href="{{ backpack_url('user') }}" class="btn btn-primary btn-block btn-lg mb-2">
                                <i class="la la-users"></i> Gestión de Usuarios
                            </a>
                            <small class="text-muted">Administrar usuarios del sistema</small>
                        </div>
                        <div class="col-md-4">
                            <a href="{{ backpack_url('public-scene') }}" class="btn btn-info btn-block btn-lg mb-2">
                                <i class="la la-map"></i> Escenas Públicas
                            </a>
                            <small class="text-muted">Gestionar escenas del juego</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection