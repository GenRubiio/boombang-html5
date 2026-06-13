<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\MailRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Prologue\Alerts\Facades\Alert;

/**
 * Class MailCrudController
 * @package App\Http\Controllers\Admin
 * @property-read \Backpack\CRUD\app\Library\CrudPanel\CrudPanel $crud
 */
class MailCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;

    /**
     * Configure the CrudPanel object. Apply settings to all operations.
     *
     * @return void
     */
    public function setup()
    {
        $this->crud->setModel(\App\Models\Mail::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/mail');
        $this->crud->setEntityNameStrings('correo', 'correos');

        // Desactivar el procesamiento automático de relaciones que manejamos manualmente
        $this->crud->setOperationSetting('saveAllInputsExcept', ['_token', '_method', 'http_referrer', 'rewards', 'user_ids']);
    }

    /**
     * Define what happens when the List operation is loaded.
     *
     * @see  https://backpackforlaravel.com/docs/crud-operation-list-entries
     * @return void
     */
    protected function setupListOperation()
    {
        $this->crud->addColumn([
            'name' => 'id',
            'label' => 'ID',
            'type' => 'number',
        ]);

        $this->crud->addColumn([
            'name' => 'title',
            'label' => 'Título',
            'type' => 'text',
        ]);

        $this->crud->addColumn([
            'name' => 'is_active',
            'label' => 'Activo',
            'type' => 'boolean',
        ]);

        $this->crud->addColumn([
            'name' => 'send_to_all',
            'label' => 'Enviar a todos',
            'type' => 'boolean',
        ]);

        $this->crud->addColumn([
            'name' => 'is_persistent',
            'label' => 'Persistente',
            'type' => 'boolean',
        ]);

        $this->crud->addColumn([
            'name' => 'gold_coins',
            'label' => 'Monedas de oro',
            'type' => 'number',
        ]);

        $this->crud->addColumn([
            'name' => 'silver_coins',
            'label' => 'Monedas de plata',
            'type' => 'number',
        ]);

        $this->crud->addColumn([
            'name' => 'created_at',
            'label' => 'Fecha de creación',
            'type' => 'datetime',
        ]);
    }

    /**
     * Define what happens when the Create operation is loaded.
     *
     * @see https://backpackforlaravel.com/docs/crud-operation-create
     * @return void
     */
    protected function setupCreateOperation()
    {
        $this->crud->setValidation(MailRequest::class);

        // Título
        $this->crud->addField([
            'name' => 'title',
            'label' => 'Título del correo',
            'type' => 'text',
            'tab' => 'Información básica',
        ]);

        // Descripción con CKEditor
        $this->crud->addField([
            'name' => 'description',
            'label' => 'Descripción (con formato HTML)',
            'type' => 'summernote',
            'tab' => 'Información básica',
        ]);

        // Activo/Inactivo
        $this->crud->addField([
            'name' => 'is_active',
            'label' => 'Correo activo',
            'type' => 'checkbox',
            'tab' => 'Información básica',
        ]);

        // Enviar a todos
        $this->crud->addField([
            'name' => 'send_to_all',
            'label' => 'Enviar a todos los usuarios',
            'type' => 'checkbox',
            'hint' => 'Si está marcado, todos los usuarios recibirán este correo automáticamente',
            'tab' => 'Destinatarios',
        ]);

        // Persistente (solo relevante si send_to_all está marcado)
        $this->crud->addField([
            'name' => 'is_persistent',
            'label' => 'Correo persistente en el tiempo',
            'type' => 'checkbox',
            'hint' => 'Si está marcado, los nuevos usuarios podrán ver y reclamar este correo aunque haya sido enviado antes de su registro. Solo aplica a correos enviados a todos los usuarios.',
            'tab' => 'Destinatarios',
        ]);

        // Usuarios específicos (solo si no es send_to_all)
        $this->crud->addField([
            'name' => 'user_ids',
            'label' => 'Usuarios destinatarios',
            'type' => 'select_from_array',
            'options' => \App\Models\User::pluck('username', 'id')->toArray(),
            'allows_multiple' => true,
            'hint' => 'Solo se usa si NO está marcado "Enviar a todos"',
            'tab' => 'Destinatarios',
            'fake' => true, // Este campo no existe en la tabla, lo manejamos manualmente
            'store_in' => 'user_ids', // Guardar en un campo temporal
        ]);

        // Monedas de oro
        $this->crud->addField([
            'name' => 'gold_coins',
            'label' => 'Créditos de oro',
            'type' => 'number',
            'default' => 0,
            'tab' => 'Recompensas',
        ]);

        // Monedas de plata
        $this->crud->addField([
            'name' => 'silver_coins',
            'label' => 'Créditos de plata',
            'type' => 'number',
            'default' => 0,
            'tab' => 'Recompensas',
        ]);

        // Items del catálogo (repeatable)
        $this->crud->addField([
            'name' => 'rewards',
            'label' => 'Objetos del catálogo',
            'type' => 'json',
            'view_namespace' => 'json-field-for-backpack::fields',
            'fields' => [
                [
                    'name' => 'catalog_item_id',
                    'type' => 'select_from_array',
                    'label' => 'Objeto',
                    'options' => \App\Models\CatalogItem::pluck('name', 'id')->toArray(),
                    'wrapper' => [
                        'class' => 'form-group col-md-8',
                    ],
                ],
                [
                    'name' => 'quantity',
                    'type' => 'number',
                    'label' => 'Cantidad',
                    'default' => 1,
                    'wrapper' => [
                        'class' => 'form-group col-md-4',
                    ],
                ],
            ],
            'new_item_label' => 'Añadir objeto',
            'init_rows' => 0,
            'min_rows' => 0,
            'max_rows' => 10,
            'tab' => 'Recompensas',
            'fake' => true, // Este campo no existe en la tabla, lo manejamos manualmente
            'store_in' => 'rewards', // Guardar en un campo temporal
        ]);
    }

    /**
     * Define what happens when the Update operation is loaded.
     *
     * @see https://backpackforlaravel.com/docs/crud-operation-update
     * @return void
     */
    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }

    /**
     * Define what happens when the Show operation is loaded.
     *
     * @see https://backpackforlaravel.com/docs/crud-operation-show
     * @return void
     */
    protected function setupShowOperation()
    {
        $this->setupListOperation();

        $this->crud->addColumn([
            'name' => 'description',
            'label' => 'Descripción',
            'type' => 'text',
            'escaped' => false,
        ]);

        $this->crud->addColumn([
            'name' => 'users',
            'label' => 'Destinatarios',
            'type' => 'relationship_count',
            'suffix' => ' usuarios',
        ]);

        $this->crud->addColumn([
            'name' => 'rewards',
            'label' => 'Objetos recompensa',
            'type' => 'relationship_count',
            'suffix' => ' objetos',
        ]);
    }

    /**
     * Store logic override para manejar las relaciones
     */
    public function store()
    {
        $this->crud->hasAccessOrFail('create');

        // execute the FormRequest authorization and validation, if one is required
        $request = $this->crud->validateRequest();

        // register any Model Events defined on fields
        $this->crud->registerFieldEvents();

        // insert item in the db - esto maneja traducciones automáticamente
        $item = $this->crud->create($this->crud->getStrippedSaveRequest($request));
        $this->data['entry'] = $this->crud->entry = $item;

        // Guardar recompensas (objetos del catálogo)
        $rewards = $request->input('rewards', []);
        if (is_array($rewards)) {
            foreach ($rewards as $reward) {
                if (isset($reward['catalog_item_id']) && !empty($reward['catalog_item_id'])) {
                    \App\Models\MailReward::create([
                        'mail_id' => $item->id,
                        'catalog_item_id' => $reward['catalog_item_id'],
                        'quantity' => $reward['quantity'] ?? 1,
                    ]);
                }
            }
        }

        // Guardar destinatarios (solo si no es send_to_all)
        if (!$item->send_to_all) {
            $userIds = $request->input('user_ids', []);
            if (is_array($userIds)) {
                foreach ($userIds as $userId) {
                    \App\Models\MailRecipient::create([
                        'mail_id' => $item->id,
                        'user_id' => $userId,
                        'is_read' => false,
                        'is_claimed' => false,
                    ]);
                }
            }
        }

        // show a success message
        \Alert::success(trans('backpack::crud.insert_success'))->flash();

        // save the redirect choice for next time
        $this->crud->setSaveAction();

        return $this->crud->performSaveAction($item->getKey());
    }

    /**
     * Update logic override para manejar las relaciones
     */
    public function update()
    {
        $this->crud->hasAccessOrFail('update');

        // execute the FormRequest authorization and validation, if one is required
        $request = $this->crud->validateRequest();

        // register any Model Events defined on fields
        $this->crud->registerFieldEvents();

        // get the ID from the request
        $id = $this->crud->getCurrentEntryId() ?? $request->get((new \App\Models\Mail)->getKeyName());

        // update the row in the db - esto maneja traducciones automáticamente
        $item = $this->crud->update(
            $id,
            $this->crud->getStrippedSaveRequest($request)
        );
        $this->data['entry'] = $this->crud->entry = $item;

        // Actualizar recompensas (eliminar las existentes y crear las nuevas)
        \App\Models\MailReward::where('mail_id', $item->id)->delete();
        $rewards = $request->input('rewards', []);
        if (is_array($rewards)) {
            foreach ($rewards as $reward) {
                if (isset($reward['catalog_item_id']) && !empty($reward['catalog_item_id'])) {
                    \App\Models\MailReward::create([
                        'mail_id' => $item->id,
                        'catalog_item_id' => $reward['catalog_item_id'],
                        'quantity' => $reward['quantity'] ?? 1,
                    ]);
                }
            }
        }

        // Actualizar destinatarios (solo si no es send_to_all)
        if (!$item->send_to_all) {
            // Eliminar destinatarios existentes
            \App\Models\MailRecipient::where('mail_id', $item->id)->delete();

            $userIds = $request->input('user_ids', []);
            if (is_array($userIds)) {
                foreach ($userIds as $userId) {
                    \App\Models\MailRecipient::firstOrCreate([
                        'mail_id' => $item->id,
                        'user_id' => $userId,
                    ], [
                        'is_read' => false,
                        'is_claimed' => false,
                    ]);
                }
            }
        }

        // show a success message
        Alert::success(trans('backpack::crud.update_success'))->flash();

        // save the redirect choice for next time
        $this->crud->setSaveAction();

        return $this->crud->performSaveAction($item->getKey());
    }
}
