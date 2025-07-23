<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\MultimediaCreateRequest;
use App\Http\Requests\MultimediaUpdateRequest;
use App\Models\Multimedia;
use Backpack\CRUD\app\Http\Controllers\CrudController;

class MultimediaCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ShowOperation;

    public function setup()
    {
        if (!isAdminOrSuperadmin()) {
            abort(403);
        }

        $this->crud->setModel(\App\Models\Multimedia::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/multimedia');
        $this->crud->setEntityNameStrings('multimedia', 'multimedia');

        $this->crud->addButtonFromView('line', 'copyToClipboard', 'copy-to-clipboard', 'beginning');
    }

    protected function setupListOperation()
    {
        if (!isSuperadmin()) {
            $this->crud->removeButtons(['revise']);
        }

        $this->crud->setColumns([
            [
                'name' => 'id',
                'label' => trans('admin.id')
            ],
            [
                'name' => 'name',
                'label' => trans('backpack::settings.name'),
            ],
            [
                'name' => 'url_file',
                'label' => trans('admin.file'),
            ],
            [
                'name' => 'active',
                'type' => 'btnToggle',
                'label' => trans('admin.active'),
            ],
        ]);
    }

    protected function setupShowOperation()
    {
        $this->crud->setColumns([
            [
                'name' => 'id',
                'label' => trans('admin.id')
            ],
            [
                'name' => 'name',
                'label' => trans('backpack::settings.name'),
            ],
            [
                'name' => 'url_file',
                'type' => 'text',
                'limit' => '2000',
                'label' => trans('admin.file'),
            ],
        ]);
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(MultimediaCreateRequest::class);

        $this->addFieldsMultimedia();
    }

    protected function setupUpdateOperation()
    {
        $this->crud->setValidation(MultimediaUpdateRequest::class);

        $this->addFieldsMultimedia();
    }

    public function addFieldsMultimedia()
    {
        $this->crud->addFields([
            [
                'name' => 'name',
                'label' => trans('admin.name'),
                'type' => 'text'
            ],
            [
                'name' => 'file',
                'label' => trans('admin.file'),
                'type' => 'upload',
                'upload' => true,
                //'disk' => 'uploads', // if you store files in the /public folder, please ommit this; if you store them in /storage or S3, please specify it;
                // optional:
                //'temporary' => 10 // if using a service, such as S3, that requires you to make temporary URL's this will make a URL that is valid for the number of minutes specified
            ],
            [
                'name' => 'active',
                'label' => trans('admin.active'),
                'type' => 'radio',
                'options' => [
                    1 => trans('backpack::crud.yes'),
                    0 => trans('backpack::crud.no')
                ],
                'default' => 0,
                'inline' => true,
            ],
        ]);
    }

    public function destroy($id)
    {
        $disk = "uploads";
        $this->crud->hasAccessOrFail('delete');
        $object = Multimedia::find($id);
        removeFile($disk, $object->file);
        return $this->crud->delete($object->id);
    }
}
