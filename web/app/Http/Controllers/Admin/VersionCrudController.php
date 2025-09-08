<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\VersionCreateRequest;
use App\Http\Requests\VersionUpdateRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use App\Http\Controllers\Admin\Traits\SuperadminProtection;

class VersionCrudController extends CrudController
{
    use SuperadminProtection;
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;

    public function setup()
    {
        $this->applySuperadminProtection();

        $this->crud->setModel(\App\Models\Version::class);
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/version');
        $this->crud->setEntityNameStrings('versión', 'versiones');

        $this->crud->addButtonFromView('top', 'createMajorVersion', 'create-major-version', 'end');
        $this->crud->addButtonFromView('top', 'createMinorVersion', 'create-minor-version', 'end');
        $this->crud->addButtonFromView('top', 'createPatchVersion', 'create-patch-version', 'end');
    }

    protected function setupListOperation()
    {
        $this->crud->removeButtons(['create', 'delete']);

        $this->crud->column('tag');
        $this->crud->column('name');
        $this->crud->column('date');
        $this->crud->column('commit');
    }

    protected function setupCreateOperation()
    {
        $this->crud->setValidation(VersionCreateRequest::class);

        $commitId = strip_tags(shell_exec('/usr/bin/git rev-parse --short HEAD 2>&1'));
        $commitId = trim(preg_replace('/\s\s+/', ' ', $commitId));
        if (strlen($commitId) != 7) {
            $commitId = "";
        }
        $currentVersion = currentVersionObject();
        $major = $minor = $patch = 0;
        if ($currentVersion && !is_null(request()->version)) {
            $major = $currentVersion->major;
            $minor = $currentVersion->minor;
            $patch = $currentVersion->patch;
            if (request()->version == 'major') {
                $minor = $patch = 0;
                $major++;
            } elseif (request()->version == 'minor') {
                $patch = 0;
                $minor++;
            } else {
                $patch++;
            }
        }
        $tag = $major . '.' . $minor . '.' . $patch;

        $this->crud->addFields([
            [
                'name' => 'tag_version',
                'type' => 'custom_html',
                'value' => '<br><h4><b>Version ' . $tag . '</b></h4>',
            ],
            [
                'name' => 'tag',
                'type' => 'hidden',
                'label' => trans('admin.tag'),
                'value' => $tag,
                'attributes' => [
                    'readonly' => 'readonly',
                ],
            ],
            [
                'name' => 'major',
                'value' => $major,
                'type' => 'hidden',
            ],
            [
                'name' => 'minor',
                'value' => $minor,
                'type' => 'hidden',
            ],
            [
                'name' => 'patch',
                'value' => $patch,
                'type' => 'hidden',
            ],
            [
                'name' => 'name',
                'label' => trans('admin.name'),
                'type' => 'text',
            ],
            [
                'name' => 'description',
                'label' => trans('admin.description'),
                'type' => 'textarea',
            ],
            [
                'name' => 'date',
                'label' => trans('admin.date'),
                'type' => 'datetime',
                'value' => now(),
            ],
            [
                'name' => 'commit',
                'label' => trans('admin.commit_code'),
                'type' => 'text',
                'value' => $commitId,
            ],
        ]);
        $this->crud->field('date');
        $this->crud->field('commit');
    }

    protected function setupUpdateOperation()
    {
        $this->crud->setValidation(VersionUpdateRequest::class);

        $this->crud->addField([
            'name' => 'tag_version',
            'type' => 'custom_html',
            'value' => '<br><h4><b>Version ' . $this->crud->getCurrentEntry()->tag . '</b></h4>',
        ]);
        $this->crud->field('name');
        $this->crud->field('description');
        $this->crud->field('commit');
    }

    protected function store()
    {
        $responseTrait = $this->traitStore();
        if (!is_null($responseTrait->getRequest()->tag)) {
            $tagName = $responseTrait->getRequest()->tag;
            executeShellCommand('/usr/bin/git tag -a ' . $tagName . ' -m "' . $responseTrait->getRequest()->name . '"');
            executeShellCommand('/usr/bin/git push origin ' . $tagName);
        }

        return $responseTrait;
    }
}
