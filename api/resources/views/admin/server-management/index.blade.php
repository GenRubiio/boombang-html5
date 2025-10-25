@extends(backpack_view('blank'))

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fa fa-server"></i> Gestión del Servidor
                    </h3>
                </div>
                <div class="card-body">
                    @if(session('success'))
                        <div class="alert alert-success alert-dismissible fade show" role="alert">
                            <i class="fa fa-check-circle"></i> {{ session('success') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    @endif

                    @if(session('error'))
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <i class="fa fa-exclamation-circle"></i> {{ session('error') }}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    @endif

                    <div class="row">
                        <div class="col-md-6">
                            <h5><i class="fa fa-docker"></i> Control del Servidor Docker</h5>
                            <p class="text-muted">
                                Utiliza el botón de abajo para reiniciar el servidor Docker Node.js. 
                                Esta acción creará un job en cola que ejecutará el comando de reinicio en el servidor.
                            </p>
                            
                            <form method="POST" action="{{ route('admin.server-management.restart') }}" style="display: inline;">
                                @csrf
                                <button type="submit" class="btn btn-warning btn-lg" 
                                        onclick="return confirm('¿Estás seguro de que quieres reiniciar el servidor? Esto puede afectar a los usuarios conectados.')">
                                    <i class="fa fa-refresh"></i> Reiniciar Servidor
                                </button>
                            </form>
                        </div>
                        
                        <div class="col-md-6">
                            <h5><i class="fa fa-info-circle"></i> Información</h5>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">
                                    <strong>Servidor:</strong> boombang-html5-server-1
                                </li>
                                <li class="list-group-item">
                                    <strong>Comando:</strong> <code>sudo docker restart boombang-html5-server-1</code>
                                </li>
                                <li class="list-group-item">
                                    <strong>Método:</strong> Job en cola de Laravel
                                </li>
                                <li class="list-group-item">
                                    <strong>Logs:</strong> Revisa los logs de Laravel para detalles
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('after_scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Auto-ocultar alerts después de 5 segundos
        setTimeout(function() {
            var alerts = document.querySelectorAll('.alert');
            alerts.forEach(function(alert) {
                if (alert.classList.contains('show')) {
                    var bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            });
        }, 5000);
    });
</script>
@endsection