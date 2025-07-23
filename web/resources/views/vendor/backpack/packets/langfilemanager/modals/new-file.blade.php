<button id="create-new-file-button" class="btn btn-primary mb-2" aria-controls="crudTable" data-toggle="modal"
    data-target="#newFileModal" tabindex="0" data-backdrop="false">
    <i class="la la-plus"></i>
    <span>Crear archivo</span>
</button>

<div class="modal fade" id="newFileModal" tabindex="-1" role="dialog" aria-labelledby="newFileModalTitle"
    aria-hidden="true" style="background-color:#0000005c">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Crear archivo</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="form-create-file" data-url="{{ url(config('backpack.base.route_prefix', 'admin') . "/language/create/file") }}">
                @csrf
                <div class="modal-body">
                    <div class="form-group">
                        <small id="form-create-file_name-error" class="d-none form-text text-muted" style="color:red !important"></small>
                        <label for="file_name">Nombre del archivo de traducciones</label>
                        <input type="text" name="file_name" class="form-control" id="file_name" placeholder="home" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                    <button id="form-create-file_submit" type="submit" class="btn btn-primary">Crear archivo</button>
                </div>
            </form>
        </div>
    </div>
</div>
