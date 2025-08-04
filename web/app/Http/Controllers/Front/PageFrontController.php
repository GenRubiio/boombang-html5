<?php

namespace App\Http\Controllers\Front;

use App\Models\Page;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Front\Pages\HomePageFrontController;

class PageFrontController extends Controller
{
    /**
     * Para las páginas de primer nivel
     */
    public function indexFirstLevel($slug = null)
    {
        if (is_null($slug)) {
            $page = Page::findSlugOrFail('home');
            return $this->displayPage($page);
        } elseif ($slug == 'home') {
            return redirect()->route('home');
        }

        $page = Page::findSlugOrFail($slug);
        if (!is_null($page->parent_id)) {
            abort(404);
        }
        return $this->displayPage($page);
    }

    /**
     * Para las páginas de segundo nivel
     */
    public function indexSecondLevel($slugFirstLevel, $slugSecondLevel)
    {
        $entity = "objects";
        $variable = "object";
        $returnObject = false;
        $pageParent = Page::findSlugOrFail($slugFirstLevel);

        if ($object = $this->getObjectItems($pageParent->name, $slugSecondLevel)) {
            if (!is_null($object['object'])) {
                $returnObject = true;
                $entity = $object['entity'];
                $variable = (isset($object['variable']) ? $object['variable'] : "object");
                $objectItem = $object['object'];
                $nameBlade = $object['nameBlade'];
                $items = $object['items'];
            }
        }

        if ($returnObject) {
            $return = $this->displayObject($pageParent, null, $entity, $variable, $objectItem, $nameBlade, $items);
        } else {
            $pageSon = Page::findSlugOrFail($slugSecondLevel, $pageParent->id);
            $return = $this->displayPage($pageSon);
        }
        return $return;
    }

    /**
     * Para las páginas de tercer nivel
     */
    public function indexThirdLevel($slugFirstLevel, $slugSecondLevel, $slugThirdLevel)
    {
        $pageFirstLevel = Page::findSlugOrFail($slugFirstLevel);
        $pageSecondLevel = Page::findSlugOrFail($slugSecondLevel, $pageFirstLevel->id);

        $objectItem = $nameBlade = null;
        $entity = "objects";
        $variable = "object";

        if ($object = $this->getObjectItems($pageSecondLevel->name, $slugSecondLevel, $slugThirdLevel)) {
            if (!is_null($object['object'])) {
                $entity = $object['entity'];
                $variable = (isset($object['variable']) ? $object['variable'] : "object");
                $objectItem = $object['object'];
                $nameBlade = $object['nameBlade'];
                $items = $object['items'];
            } else {
                abort(404);
            }
        }

        return $this->displayObject($pageFirstLevel, $pageSecondLevel, $entity, $variable, $objectItem, $nameBlade, $items);
    }

    public function displayPage($page)
    {
        $this->data['title'] = $page->title;
        $this->data['page'] = $page->withFakes();
        $this->data['items'] = $this->getItemsPage(Str::ucfirst(Str::camel($page->name)));

        if (checkIfPageRequireAuthentication($page) && !Auth::check()) {
            return redirect('login');
        }

        return view(getBladePath($page), $this->data);
    }

    public function displayObject($pageFirstLevel, $pageSecondLevel, $entity, $variable, $object, $nameBlade, $items = null)
    {
        $pageParent = $pageSecondLevel ?? $pageFirstLevel;

        $this->data['title'] = $object->name ?? $object->title;
        $this->data['page'] = $pageParent; // TODO (!$isBlog ? modifyMetasPageCategory($page, $object) : $page);
        $this->data['pageFirstLevel'] = $pageFirstLevel; // TODO (!$isBlog ? modifyMetasPageCategory($page, $object) : $page);
        $this->data['items'][$variable] = $object;
        $this->data['items']['category'] = $object;
        $this->data['items'][$entity] = $items;

        if (checkIfPageRequireAuthentication($pageParent)) {
            if (!Auth::check()) {
                return redirect('login');
            }
        }

        return view(getBladeTemplatePath($pageParent) . '.' . $nameBlade, $this->data);
    }

    /**
     * Capturamos el nombre en UpperCamelCase y llamamos a la función para devolver items. Ejemplo con News.
     */
    public function getItemsPage($pageName): array
    {
        switch ($pageName) {
             case "Home":
                $return = (array)(new HomePageFrontController())->index();
                break;
            case "News":
                $return = (array)(new BlogArticleFrontController())->index();
                break;
            case "Pages":
                $return = $this->getPages();
                break;
            default:
                $return = [];
        }
        return $return;
    }

    public function getObjectItems($pageName, $slugSecondLevel = null, $slugThirdLevel = null)
    {
        $objectEntity = $slugThirdLevel ?? $slugSecondLevel;
        $object = [];

        switch ($pageName) {
            /*
             * Example with services
            case "Pages":
                $object['entity'] = "pages";
                $object['variable'] = "page";
                $object['nameBlade'] = "pages";
                $object['object'] = (new PageService)->show($objectEntity);
                $object['items'] = (new PageService)->getItems($objectEntity);
                break;
            */
            case "News":
                $object['entity'] = "blogs";
                $object['variable'] = "article";
                $object['nameBlade'] = "article";
                $object['object'] = (new BlogArticleFrontController())->show($objectEntity) ?? abort(404);
                $object['items'] = (new BlogArticleFrontController())->showItems();
                break;
            default:
                $object = false;
        }
        return $object;
    }

    public static function getPages()
    {
        $pages = Page::all();
        return ['pages' => $pages];
    }
}
