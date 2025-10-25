@php
    $widget['wrapper']['class'] = $widget['wrapper']['class'] ?? 'col-sm-6 col-lg-3';
@endphp

@includeWhen(!empty($widget['wrapper']), 'backpack::widgets.inc.wrapper_start')
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
@includeWhen(!empty($widget['wrapper']), 'backpack::widgets.inc.wrapper_end')