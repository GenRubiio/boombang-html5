<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Str;
use App\Enums\CatalogItemTypesEnum;
use App\Http\Requests\CatalogItemRequest;
use App\Services\External\GeminiAiService;
use Backpack\CRUD\app\Http\Controllers\CrudController;

class CatalogItemCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation {
        update as traitUpdate;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        $this->crud->setModel(\App\Models\CatalogItem::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/catalog-item');
        $this->crud->setEntityNameStrings('artículo de catálogo', 'artículos de catálogo');

        $this->setupRoleBasedAccess();
    }

    /**
     * Setup role-based access control
     */
    protected function setupRoleBasedAccess()
    {
        $user = backpack_user();

        // Check if user has Superadmin role - full access
        if ($user && $user->hasRole('Superadmin')) {
            return; // Superadmin has full access, no restrictions
        }

        // Check if user has Catalog role - restricted access
        if ($user && $user->hasRole('Catalog')) {
            // Restrict to only items created by this user
            $this->crud->addClause('where', 'user_id', $user->id);
            return;
        }

        // If user doesn't have required roles, deny access
        abort(403, 'No tienes permisos para acceder a esta sección.');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumn([
            'name' => 'id',
            'label' => 'ID',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'image',
            'label' => 'Imagen',
            'type' => 'image',
        ]);
        $this->crud->addColumn([
            'name' => 'name',
            'label' => 'Nombre',
            'type' => 'text',
        ]);
        $this->crud->addColumn([
            'name' => 'category_id',
            'label' => 'Categoría',
            'type' => 'select',
            'entity' => 'category',
            'attribute' => 'name',
            'model' => "App\Models\CatalogCategory",
        ]);
        $this->crud->addColumn([
            'name' => 'price',
            'label' => 'Precio',
            'type' => 'number',
        ]);
        $this->crud->addColumn([
            'name' => 'is_active',
            'label' => 'Activo',
            'type' => 'check',
        ]);

        // Add creator column for Superadmin users
        if (backpack_user() && backpack_user()->hasRole('Superadmin')) {
            $this->crud->addColumn([
                'name' => 'user_id',
                'label' => 'Creado por',
                'type' => 'select',
                'entity' => 'user',
                'attribute' => 'name',
                'model' => "App\Models\User",
            ]);
        }
    }

    protected function setupCreateOperation()
    {
        // Check permissions for create operation
        $this->checkCreatePermissions();

        $this->crud->setValidation(CatalogItemRequest::class);

        $this->crud->addFields([
            [
                'name' => 'name',
                'label' => 'Nombre',
                'type' => 'text',
                'tab' => 'General'
            ],
            [
                'name' => 'description',
                'label' => 'Descripción',
                'type' => 'ckeditor',
                'tab' => 'General'
            ],
            [
                'name' => 'category_id',
                'label' => 'Categoría',
                'type' => 'select2',
                'entity' => 'category',
                'attribute' => 'name',
                'model' => "App\Models\CatalogCategory",
                'tab' => 'General'
            ],
            [
                'name' => 'sprite_name',
                'label' => 'Nombre del Sprite',
                'type' => 'text',
                'hint' => 'El nombre del sprite debe ser único y se usará para referenciar este objeto en el juego.<br>Ejemplo: "tree_01", "house_red", etc.',
                'tab' => 'General'
            ],
            [
                'name' => 'image',
                'label' => 'Imagen',
                'type' => 'image',
                'disk'  => 'uploads',
                'upload' => true,
                'hint' => 'Esta imagen se usará como vista previa en el catálogo.',
                'tab' => 'General'
            ],
            [
                'name' => 'spreadsheet',
                'label' => 'Phaser Spreadsheet',
                'type' => 'upload',
                'upload' => true,
                'hint' => 'Spreadsheet exportado desde TexturePacker o la imagen del objeto sin perder calidad.<br>Formatos soportados: WEBP, WEBM',
                'wrapper' => ['class' => 'form-group col-md-6'],
                'tab' => 'General'
            ],
            [
                'name' => 'atlas',
                'label' => 'Phaser Atlas',
                'type' => 'upload',
                'upload' => true,
                'hint' => 'Atlas exportado desde TexturePacker en formato JSON Hash.',
                'wrapper' => ['class' => 'form-group col-md-6'],
                'tab' => 'General'
            ],
            [
                'name' => 'width',
                'label' => 'Ancho',
                'type' => 'number',
                'default' => null,
                'suffix' => 'px',
                'hint' => 'Ancho del objeto en píxeles. Dejar en blanco para usar el ancho original de la imagen.',
                'wrapper' => ['class' => 'form-group col-md-6'],
                'tab' => 'General'
            ],
            [
                'name' => 'height',
                'label' => 'Alto',
                'type' => 'number',
                'default' => null,
                'suffix' => 'px',
                'hint' => 'Alto del objeto en píxeles. Dejar en blanco para usar el alto original de la imagen.',
                'wrapper' => ['class' => 'form-group col-md-6'],
                'tab' => 'General'
            ],
            [
                'name' => 'price',
                'label' => 'Precio',
                'type' => 'number',
                'default' => 0,
                'tab' => 'Precios'
            ],
            [
                'name' => 'price_type',
                'label' => 'Tipo de Precio',
                'type' => 'select_from_array',
                'options' => [
                    'golden_coins' => 'Monedas Doradas',
                    'silver_coins' => 'Monedas Plateadas',
                ],
                'tab' => 'Precios'
            ],
            [
                'name' => 'discount',
                'label' => 'Descuento',
                'type' => 'number',
                'default' => 0,
                'tab' => 'Precios'
            ],
            [
                'name' => 'type',
                'label' => 'Tipo',
                'type' => 'select_from_array',
                'options' => CatalogItemTypesEnum::toAssociativeArray(),
                'hint' => 'El tipo de artículo determina cómo se comporta en el juego.',
                'tab' => 'Configuración'
            ],
            [
                'name' => 'stars',
                'label' => 'Estrellas',
                'type' => 'select_from_array',
                'options' => [
                    1 => '1 Estrella',
                    2 => '2 Estrellas',
                    3 => '3 Estrellas',
                    4 => '4 Estrellas',
                    5 => '5 Estrellas',
                ],
                'hint' => 'Clasificación del artículo. Afecta su rareza y valor en el juego.',
                'tab' => 'Configuración'
            ],
            [
                'name' => 'map_size',
                'label' => 'Tamaño del Mapa',
                'type' => 'text',
                'default' => '[[0, 0]]',
                'hint' => 'Define las celdas que ocupa el objeto en el mapa. Formato: [[x1, y1], [x2, y2], ...] donde cada par representa una celda ocupada.<br>Ejemplo para un objeto que ocupa 2x2 celdas: [[0, 0], [0, 1], [1, 0], [1, 1]]',
                'tab' => 'Configuración'
            ],
            [
                'name' => 'user_decoration_type',
                'label' => 'Tipo de Decoración de Usuario',
                'type' => 'select_from_array',
                'options' => [
                    'ficha' => 'Ficha',
                    'chat' => 'Chat',
                    'name' => 'Name',
                    'shadow' => 'Shadow',
                    'avatar' => 'Avatar'
                ],
                'hint' => 'Tipo de decoración que este artículo proporciona al usuario.<br>Dejar en blanco si no es una decoración.',
                'tab' => 'Configuración'
            ],
            [
                'name' => 'user_decoration_value',
                'label' => 'Valor de Decoración de Usuario',
                'type' => 'text',
                'hint' => 'Valor asociado a la decoración del usuario. Por ejemplo, el nombre del sprite para una ficha o el color para el chat.<br>Dejar en blanco si no es una decoración.',
                'tab' => 'Configuración'
            ],
            [
                'name' => 'in_lobby_gacha',
                'label' => 'En Lobby Gacha',
                'type' => 'checkbox',
                'tab' => 'Configuración'
            ],
            [
                'name' => 'show_in_inventory',
                'label' => 'Mostrar en Inventario',
                'type' => 'checkbox',
                'default' => true,
                'tab' => 'Configuración'
            ],
            [
                'name' => 'is_purchasable',
                'label' => 'Comprable',
                'type' => 'checkbox',
                'default' => true,
                'tab' => 'Configuración'
            ],
            [
                'name' => 'ai_translate',
                'label' => 'AI Translate',
                'type' => 'checkbox',
                'tab' => 'General'
            ],
            [
                'name' => 'is_active',
                'label' => 'Activo',
                'type' => 'checkbox',
                'default' => true,
                'tab' => 'Configuración'
            ]
        ]);

        if (backpack_user() && backpack_user()->hasRole('Catalog')) {
            $this->crud->addField([
                'name' => 'user_id',
                'type' => 'hidden',
                'value' => backpack_user()->id,
            ]);
        }
    }

    protected function setupUpdateOperation()
    {
        // Check permissions for update operation
        $this->checkUpdatePermissions();

        $this->setupCreateOperation();
    }

    protected function store()
    {
        // Ensure user_id is set for Catalog users
        if (backpack_user() && backpack_user()->hasRole('Catalog')) {
            $this->crud->getRequest()->merge(['user_id' => backpack_user()->id]);
        }

        //if (empty($this->crud->getRequest()->get('sprite_name')) && $this->crud->getRequest()->get('name')) {
        //    $spriteName = Str::slug($this->crud->getRequest()->get('name'), '_');
        //    $this->crud->getRequest()->merge(['sprite_name' => $spriteName]);
        //}

        $response = $this->traitStore();
        if ($this->crud->getRequest()->get('ai_translate')) {
            app(GeminiAiService::class)->translate($this->crud->entry);
        }
        return $response;
    }

    protected function update()
    {
        $response = $this->traitUpdate();
        if ($this->crud->getRequest()->get('ai_translate')) {
            app(GeminiAiService::class)->translate($this->crud->entry);
        }
        return $response;
    }

    /**
     * Check permissions for create operation
     */
    protected function checkCreatePermissions()
    {
        $user = backpack_user();

        if (!$user) {
            abort(403, 'Debes estar autenticado.');
        }

        // Superadmin can create
        if ($user->hasRole('Superadmin')) {
            return;
        }

        // Catalog users can create
        if ($user->hasRole('Catalog')) {
            return;
        }

        abort(403, 'No tienes permisos para crear artículos de catálogo.');
    }

    /**
     * Check permissions for update operation
     */
    protected function checkUpdatePermissions()
    {
        $user = backpack_user();

        if (!$user) {
            abort(403, 'Debes estar autenticado.');
        }

        // Superadmin can update any item
        if ($user->hasRole('Superadmin')) {
            return;
        }

        // Catalog users can only update their own items
        if ($user->hasRole('Catalog')) {
            $itemId = $this->crud->getCurrentEntryId();
            if ($itemId) {
                $item = $this->crud->getModel()->find($itemId);
                if (!$item || $item->user_id !== $user->id) {
                    abort(403, 'Solo puedes modificar artículos que has creado.');
                }
            }
            return;
        }

        abort(403, 'No tienes permisos para modificar artículos de catálogo.');
    }

    /**
     * Override destroy method to check delete permissions
     */
    public function destroy($id)
    {
        $user = backpack_user();

        if (!$user) {
            abort(403, 'Debes estar autenticado.');
        }

        // Superadmin can delete any item
        if ($user->hasRole('Superadmin')) {
            return $this->crud->delete($id);
        }

        // Catalog users can only delete their own items
        if ($user->hasRole('Catalog')) {
            $item = $this->crud->getModel()->find($id);
            if (!$item || $item->user_id !== $user->id) {
                abort(403, 'Solo puedes eliminar artículos que has creado.');
            }
            return $this->crud->delete($id);
        }

        abort(403, 'No tienes permisos para eliminar artículos de catálogo.');
    }
}
