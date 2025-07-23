<button id="validate-translations-button" class="btn btn-info mb-2" aria-controls="crudTable" data-toggle="modal"
    data-target="#validateTranslationsModal" tabindex="0" data-backdrop="false">
    <i class="las la-stream"></i>
    <span>Cuadrar traducciones</span>
</button>

<div class="modal fade" id="validateTranslationsModal" tabindex="-1" role="dialog"
    aria-labelledby="validateTranslationsModalTitle" aria-hidden="true" style="background-color:#0000005c">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Cuadrar traducciones</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="form-validate-translations"
                data-url="{{ url(config('backpack.base.route_prefix', 'admin') . '/language/square/translation') }}">
                @csrf
                <div class="modal-body">
                    <small id="form-validate-translations_name-error" class="d-none form-text text-muted"
                        style="color:red !important"></small>
                    <span style="color:red;">¡Alerta!</span> Esto creará los archivos y las keys de traducción entre TODOS los idiomas.
                    <br>
                    <div class="form-check form-switch">
                        <input name="translation_copy_value" class="form-check-input" type="checkbox" role="switch"
                            id="flexSwitchCheckChecked" checked>
                        <label class="form-check-label" for="flexSwitchCheckChecked">
                            Copiar el valor del idioma "{{ $currentLang }}" en los idiomas que no tengan la key
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                    <button id="form-validate-translations_submit" type="submit" class="btn btn-primary">
                        Cuadrar archivos
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
