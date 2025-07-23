<?php

namespace App\Http\Controllers\Admin\Operations;

use Illuminate\Support\Facades\Route;

trait ReorderFeaturedOperation
{
    /**
     * Define which routes are needed for this operation.
     *
     * @param  string  $name  Name of the current entity (singular). Used as first URL segment.
     * @param  string  $routeName  Prefix of the route name.
     * @param  string  $controller  Name of the current CrudController.
     */
    protected function setupReorderFeaturedRoutes($segment, $routeName, $controller)
    {
        Route::get($segment . '/reorder-featured', [
            'as'        => $routeName . '.reorder',
            'uses'      => $controller . '@reorderFeatured'
        ]);

        Route::post($segment . '/reorder-featured', [
            'as'        => $routeName . '.save.reorder.featured',
            'uses'      => $controller . '@saveReorderFeatured'
        ]);
    }

    /**
     * Add the default settings, buttons, etc that this operation needs.
     */
    protected function setupReorderFeaturedDefaults()
    {
        $this->crud->operation('list', function () {
            $this->crud->addButton('top', 'reorder-featured', 'view', 'end');
        });
    }

    public function reorderFeatured()
    {
        $this->crud->set('reorder.label', 'reorder_name');
        $this->crud->set('reorder.max_level', 1);

        $this->crud->addClause('where', 'featured', true);

        $this->data['entries'] = $this->crud->getEntries();
        $this->data['crud'] = $this->crud;
        $this->data['title'] = $this->crud->getTitle() ?? trans('backpack::crud.reorder') . ' ' . $this->crud->entity_name;

        // load the view from /resources/views/vendor/backpack/crud/ if it exists, otherwise load the one in the package
        return view('vendor.backpack.views.reorder-featured', $this->data);
    }

    public function saveReorderFeatured()
    {
        $all_entries = json_decode(\Request::input('tree'), true);
        if (count($all_entries)) {
            foreach ($all_entries as $key => $entry) {
                $this->crud->model->where('id', $entry['item_id'])->update(['featured_order' => $key]);
            }
        } else {
            return false;
        }

        return 'success for ' . count($all_entries) . ' items';
    }
}
