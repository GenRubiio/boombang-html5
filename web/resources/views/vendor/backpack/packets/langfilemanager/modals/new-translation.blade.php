<button id="create-new-translation-button" class="btn btn-success mb-2" aria-controls="crudTable" data-toggle="modal"
    data-target="#newTranslationModal" tabindex="0" data-backdrop="false">
    <i class="la la-plus"></i>
    <span>Crear traduccion</span>
</button>

<div class="modal fade" id="newTranslationModal" tabindex="-1" role="dialog" aria-labelledby="newTranslationModalTitle"
    aria-hidden="true" style="background-color:#0000005c">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Crear Traduccion</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="form-create-translation"
                data-url="{{ url(config('backpack.base.route_prefix', 'admin') . '/language/create/translation') }}">
                @csrf
                <div class="modal-body">
                    <div class="form-group">
                        <small id="form-create-translation_name-error" class="d-none form-text text-muted"
                            style="color:red !important"></small>
                        <label for="translation_key">Key</label>
                        <div class="input-group mb-2">
                            <div class="input-group-prepend">
                                <div id="translation_key_file" class="input-group-text"></div>
                            </div>
                            <input id="translation_key_file_input" type="hidden" name="translation_file_name">
                            <input type="text" name="translation_key" class="form-control" id="translation_key"
                                placeholder="title" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="translation_value">Texto (para el idioma {{ $currentLang }})</label>
                        <input type="text" name="translation_value" class="form-control" id="translation_value"
                            placeholder="Welcome To The Jungle" required>
                    </div>
                    <div class="form-check form-switch">
                        <input name="translation_copy_value" class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked"
                            checked>
                        <label class="form-check-label" for="flexSwitchCheckChecked">
                            Copiar texto en todos los idiomas
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                    <button id="form-create-translation_submit" type="submit" class="btn btn-primary">Crear key</button>
                </div>
            </form>
        </div>
    </div>
</div>
