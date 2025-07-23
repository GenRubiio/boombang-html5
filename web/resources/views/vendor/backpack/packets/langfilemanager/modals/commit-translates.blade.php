<button id="commit-translates-button" class="btn btn-danger mb-2" aria-controls="crudTable" data-toggle="modal"
    data-target="#commitTranslatesModal" tabindex="0" data-backdrop="false">
    <i class="las la-stream"></i>
    <span>Subir traducciones</span>
</button>

<div class="modal fade" id="commitTranslatesModal" tabindex="-1" role="dialog"
    aria-labelledby="commitTranslatesModalTitle" aria-hidden="true" style="background-color:#0000005c">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Subir traducciones</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="form-validate-translations"
                data-url="{{ url(config('backpack.base.route_prefix', 'admin') . '/language/commit-translates') }}">
                @csrf
                <div class="modal-body">
                    <small id="form-validate-translations_name-error" class="d-none form-text text-muted"
                        style="color:red !important"></small>
                    <span style="color:red;">¡Alerta!</span>
                    Esto generará un commit y lo subirá la rama actual. En caso error, habrá que actuar manualmente para hacer "merge".
                    <br>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                    <button id="form-validate-translations_submit" type="submit" class="btn btn-danger">
                        Commitear traducciones
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
