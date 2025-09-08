<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\GalleryRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;

class GalleryCrudController extends CrudController
{
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    //use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    //use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    //use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    //use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;
    //todo use reorder pero por modelo y id y type
    use \Backpack\CRUD\app\Http\Controllers\Operations\ReorderOperation;

    public function setup()
    {
        $this->applySuperadminProtection();

        $this->crud->setModel('App\Models\Gallery');
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/gallery');
        $this->crud->setEntityNameStrings('galería', 'galerías');
    }

    protected function setupListOperation()
    {
        $this->crud->addColumns([
            [
                'name' => 'galleryable_id',
                'label' => 'Id al que referencia',
            ],
            [
                'name' => 'galleryable_type',
                'type' => 'text',
                'label' => 'Model',
            ],
            [
                'name' => 'name',
                'type' => 'text',
                'label' => trans('backpack::pagemanager.name'),
            ],
            [
                'name' => 'type',
                'type' => 'text',
                'label' => 'Tipo',
            ],
            [
                'name' => 'image',
                'label' => 'Imagen',
                'type' => 'image',
                'height' => '40px',
            ],
            [
                'name' => 'active',
                'type' => 'btnToggle',
                'label' => trans('admin.active')
            ]
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(GalleryRequest::class);

        // TODO hacer crud seleccionando las entitys existentes que puedan crear imágenes, usar el galleryobserver o copiar funcionalidad para crear, modificar o eliminar las imagenes
        // TODO: remove setFromDb() and manually define Fields
        $this->crud->setFromDb();
    }

    protected function setupUpdateOperation()
    {
        $this->setupCreateOperation();
    }

    protected function setupReorderOperation()
    {
        $filterType = request()->filterType;
        $filterGalleryableType = request()->filterGalleryableType;
        $filterGalleryableId = request()->filterGalleryableId;
        $filterMultimedia = request()->filterMultimedia;

        //Query personalized
        if (!is_null($filterType)) {
            $this->crud->addClause('where', 'type', $filterType);
            $this->setReorderBreadcrumbs();
        }
        if (!is_null($filterGalleryableType)) {
            $this->crud->addClause('where', 'galleryable_type', $filterGalleryableType);
            $this->setReorderBreadcrumbs();
        }
        if (!is_null($filterGalleryableId)) {
            $this->crud->addClause('where', 'galleryable_id', $filterGalleryableId);
            $this->setReorderBreadcrumbs();
        }
        if (!is_null($filterMultimedia)) {
            $this->crud->addClause('where', $filterMultimedia, '!=', null);
            $this->setReorderBreadcrumbs();
        }

        $this->crud->set('reorder.label', 'name');
        $this->crud->set('reorder.max_level', 1);
    }

    private function setReorderBreadcrumbs()
    {
        $this->data['breadcrumbs'] = [
            trans('backpack::crud.admin') => backpack_url('dashboard'),
            trans('admin.galleries') => backpack_url('gallery'),
            //trans('admin.pages') => false, // Other item
            trans('backpack::crud.reorder') => false,
        ];
    }
}
