<?php

namespace App\Http\Controllers\Admin;

use App\Models\BlogTag;
use App\Models\BlogCategory;
use App\Traits\Admin\Tabs\SeoTabFields;
use App\Http\Requests\BlogArticleRequest;
use Backpack\CRUD\app\Http\Controllers\CrudController;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class BlogArticleCrudController extends CrudController
{
    use \Backpack\CRUD\app\Http\Controllers\Operations\ListOperation;
    use \Backpack\CRUD\app\Http\Controllers\Operations\CreateOperation {
        store as traitStore;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\UpdateOperation {
        update as traitUpdate;
    }
    use \Backpack\CRUD\app\Http\Controllers\Operations\DeleteOperation;
    //use \Backpack\CRUD\app\Http\Controllers\Operations\FetchOperation;
    use \Backpack\Pro\Http\Controllers\Operations\FetchOperation;

    use SeoTabFields;

    public function setup()
    {
        /*
        |--------------------------------------------------------------------------
        | BASIC CRUD INFORMATION
        |--------------------------------------------------------------------------
        */
        $this->crud->setModel("App\Models\BlogArticle");
        $this->crud->setRoute(config('backpack.base.route_prefix', 'admin') . '/blog-article');
        $this->crud->setEntityNameStrings('blog article', 'blog articles');

        /*
        |--------------------------------------------------------------------------
        | LIST OPERATION
        |--------------------------------------------------------------------------
        */
        $this->crud->operation('list', function () {
            $this->crud->addColumn('title');
            $this->crud->addColumn([
                'name' => 'date',
                'label' => 'Date',
                'type' => 'date',
            ]);
            $this->crud->addColumn('status');
            $this->crud->addColumn([
                'name' => 'featured',
                'label' => 'Destacado',
                'type' => 'check',
            ]);

            $this->crud->addColumn([
                'label' => trans('admin.category'),
                'name' => 'category_id',
                'entity' => 'blogCategory',
                'attribute' => 'name',
                'wrapper'   => [
                    'href' => function ($crud, $column, $entry, $related_key) {
                        return backpack_url('blog-category/' . $related_key . '/show');
                    },
                ],
            ]);
            $this->crud->addColumn([
                'label' => trans('admin.tags'),
                'name' => 'blogTags',
                'entity' => 'blogTags',
                'attribute' => 'name',
                'wrapper'   => [
                    'href' => function ($crud, $column, $entry, $related_key) {
                        return backpack_url('blog-tag/' . $related_key . '/show');
                    },
                ],
            ]);

            $this->crud->addFilter([ // select2 filter
                'label' => trans('admin.category'),
                'name' => 'category_id',
                'type' => 'select2',
            ], function () {
                return BlogCategory::all()->keyBy('id')->pluck('name', 'id')->toArray();
            }, function ($value) { // if the filter is active
                $this->crud->addClause('where', 'category_id', $value);
            });

            $this->crud->addFilter([ // select2_multiple filter
                'label' => trans('admin.tags'),
                'name' => 'blogTags',
                'type' => 'select2_multiple',
            ], function () {
                return BlogTag::all()->keyBy('id')->pluck('name', 'id')->toArray();
            }, function ($values) { // if the filter is active
                foreach (json_decode($values) as $key => $value) {
                    $this->crud->query = $this->crud->query->whereHas('blogTags', function ($query) use ($key, $value) {
                        if ($key == 0) {
                            $query->where('blog_tags.id', $value);
                        } else {
                            $query->orWhere('blog_tags.id', $value);
                        }
                    });
                }
            });
        });

        /*
        |--------------------------------------------------------------------------
        | CREATE & UPDATE OPERATIONS
        |--------------------------------------------------------------------------
        */
        $this->crud->operation(['create', 'update'], function () {
            $this->crud->setValidation(BlogArticleRequest::class);
            $this->crud->setOperationSetting('showDeleteButton', true);

            $this->crud->addField([
                'name' => 'title',
                'label' => trans('admin.title'),
                'type' => 'text',
                'placeholder' => 'Your title here',
                'tab' => 'Blog Article',
            ]);
            $this->crud->addField([
                'name' => 'extract',
                'label' => trans('admin.extract'),
                'type' => 'ckeditor',
                'tab' => 'Blog Article',
            ]);
            $this->crud->addField([
                'name' => 'date',
                'label' => trans('admin.date'),
                'type' => 'datetime_picker',
                'datetime_picker_options' => [
                    'format' => 'DD/MM/YYYY HH:mm:ss',
                    'language' => LaravelLocalization::getCurrentLocale()
                ],
                'allows_null' => false,
                'tab' => 'Blog Article',
                //'default' => date('Y-m-d H:i:s'),
            ]);
            $this->crud->addField([
                'name' => 'content',
                'label' => trans('admin.content'),
                'type' => 'ckeditor',
                'elfinderOptions' => true,
                'placeholder' => 'Your textarea text here',
                'tab' => 'Blog Article',
            ]);
            $this->crud->addField([
                'name' => 'image',
                'label' => trans('admin.image'),
                'type' => 'image',
                'tab' => 'Blog Article',
            ]);
            $this->crud->addField([
                'label' => trans('admin.category'),
                'type' => 'relationship',
                'name' => 'category_id',
                'entity' => 'blogCategory',
                'attribute' => 'name',
                'inline_create' => true,
                'ajax' => true,
                'minimum_input_length' => 0,
                'tab' => 'Blog Article',
            ]);
            $this->crud->addField([
                'label' => trans('admin.tags'),
                'type' => 'relationship',
                'name' => 'blogTags', // the method that defines the relationship in your Model
                'entity' => 'blogTags', // the method that defines the relationship in your Model
                'attribute' => 'name', // foreign key attribute that is shown to user
                'pivot' => true, // on create&update, do you need to add/delete pivot table entries?
                'inline_create' => ['entity' => 'blog-tag'],
                'ajax' => true,
                'minimum_input_length' => 0,
                'tab' => 'Blog Article',
            ]);
            $this->crud->addField([
                'name' => 'status',
                'label' => trans('admin.status'),
                'type' => 'enum',
                'default' => 'Borrador',
                'allows_null' => true,
                'tab' => 'Blog Article',
            ]);
            $this->crud->addField([
                'name' => 'featured',
                'label' => trans('admin.featured'),
                'type' => 'checkbox',
                'tab' => 'Blog Article',
            ]);
            $this->addSeoTabFields();
        });

        $this->crud->operation('create', function () {
            $this->crud->addField([
                'name' => 'slug',
                'label' => trans('admin.slug'),
                'type' => 'slug',
                'target'  => 'title',
                'hint' => trans('admin.slug_hint'),
                'tab' => 'Blog Article',
            ])->afterField('title');
        });
        $this->crud->operation('update', function () {
            $this->crud->addField([
                'name' => 'slug',
                'type' => 'text',
                'label' => trans('admin.slug'),
                'attributes' => [
                    "required" => "required"
                ],
                'tab' => 'Blog Article',
            ])->afterField('title');
        });
    }

    protected function store()
    {
        if (is_null($this->crud->getRequest()->get('extract')) || $this->crud->getRequest()->get('extract') == "") {
            $this->crud->setRequest(request()->merge(['extract' => $this->getCutExtractFromContent($this->crud->getRequest()->get('content'))]));
        }

        $response = $this->traitStore();
        storeReplicateOtherLocales($this->crud);
        return $response;
    }

    protected function update()
    {
        if (is_null($this->crud->getRequest()->get('extract')) || $this->crud->getRequest()->get('extract') == "") {
            $this->crud->setRequest(request()->merge(['extract' => $this->getCutExtractFromContent($this->crud->getRequest()->get('content'))]));
        }

        $response = $this->traitUpdate();
        return $response;
    }

    public function getCutExtractFromContent($content)
    {
        $extract = strip_tags($content);
        return strlen($extract) > 100 ? substr($extract, 0, 100) . "..." : $extract;
    }

    public function fetchBlogCategory()
    {
        return $this->fetch(BlogCategory::class);
    }

    public function fetchBlogTags()
    {
        return $this->fetch(BlogTag::class);
    }
}
