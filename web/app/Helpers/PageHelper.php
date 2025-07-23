<?php

namespace App\Helpers;

use App\Enums\SocialNetworksEnum;
use App\Http\Resources\Page\PageResource;
use App\Models\BlogArticle;
use App\Models\BlogCategory;
use App\Models\Page;
use Illuminate\Support\Str;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class PageHelper
{
    public static function getBladePath($page)
    {
        return self::getDirectoryBladePath($page)->pathView;
    }

    public static function getBladeTemplatePath($page)
    {
        return self::getDirectoryBladePath($page)->directoryPathView;
    }

    public static function getDirectoryBladePath($page)
    {
        $directoryPath = new \stdClass();
        $directoryPath->pageTemplate = Str::slug($page->template);
        $directoryPath->basePath = '../resources/views/pages';
        $directoryPath->templatePagePath = $directoryPath->basePath . '/' . $directoryPath->pageTemplate;
        $directoryPath->nameBlade = Str::slug($page->name);
        $directoryPath->nameBladeWhitExt = $directoryPath->nameBlade . '.blade.php';
        $directoryPath->pathBlade = $directoryPath->templatePagePath . '/' . $directoryPath->nameBladeWhitExt;
        $directoryPath->directoryPathView = 'pages.' . $directoryPath->pageTemplate;
        $directoryPath->pathView = 'pages.' . $directoryPath->pageTemplate . '.' . $directoryPath->nameBlade;
        return $directoryPath;
    }

    public static function getNofollowPage($value)
    {
        return $value ? '<meta name="robots" content="noindex, nofollow">' : '';
    }

    public static function makeUrl($pageName = 'Home', $slugFirstObject = null, $slugSecondObject = null)
    {
        $url = "";
        $page = Page::findByName($pageName)->first();

        if (!is_null($page)) {
            if (!is_null($page->parent_id)) {
                $url = Page::find($page->parent_id)->slug . '/';
            }

            $url .= $page->slug;
            if (!is_null($slugFirstObject)) {
                $url .= '/' . $slugFirstObject;
                if (!is_null($slugSecondObject)) {
                    $url .= '/' . $slugSecondObject;
                }
            }
            $route = LaravelLocalization::localizeUrl(($page->slug == 'home' ? url('') : url($url)));
        } else {
            $route = LaravelLocalization::localizeUrl(url(''));
        }
        return $route;
    }

    public static function makeBreadcrumbs($pageName = 'Home', $slugFirstObject = null, $nameFirstObject = "Object", $slugSecondObject = null, $nameSecondObject = "Object")
    {
        $breadcrumbs = [];
        $breadcrumbs[trans('web.breadcrumb-home')] = makeUrl();
        $page = Page::findByName($pageName)->first();
        if (!is_null($page) && $page->name != "Home") {
            $page = $page->withFakes();
            //PageParent
            if (!is_null($page->parent_id)) {
                $pageParent = Page::find($page->parent_id);
                if (!is_null($pageParent) && $pageParent->active) {
                    $breadcrumbPageParent = $pageParent->name;
                    if (isset($pageParent->breadcrumb) && !is_null($pageParent->breadcrumb) && $pageParent->breadcrumb != "") {
                        $breadcrumbPageParent = $pageParent->breadcrumb;
                    }
                    $breadcrumbs[$breadcrumbPageParent] = makeUrl($pageParent->name);
                }
            }

            //Page
            if (isset($page->breadcrumb) && !is_null($page->breadcrumb) && $page->breadcrumb != "") {
                $breadcrumbs[$page->breadcrumb] = makeUrl($page->name);
            } else {
                $breadcrumbs[$page->title] = makeUrl($page->name);
            }

            //FirstObject or SecondObject
            if (!is_null($slugFirstObject)) {
                $breadcrumbs[$nameFirstObject] = makeUrl($page->name, $slugFirstObject);
                //Entity object
                if (!is_null($slugSecondObject)) {
                    $breadcrumbs[$nameSecondObject] = makeUrl($page->name, $slugSecondObject);
                }
            }
        }

        return $breadcrumbs;
    }

    public static function translateUrl($locale, $pageName, $slugObject, $slugEntityObject = null)
    {
        $slugObjectTranslated = $slugEntityObjectTranslated = "";
        switch ($pageName) {
            case "News":
                $entity = "BlogArticle";
                break;
            default:
                $entity = null;
                break;
        }

        if (!is_null($entity)) {
            if ($entity == "BlogArticle") {
                $article = BlogArticle::whereSlug($slugObject)->first();
                if (!is_null($article)) {
                    $slugObjectTranslated = $article->getTranslation('slug', $locale);
                }
            } // Example
            elseif ($entity == "BlogCategory") {
                $category = BlogCategory::whereSlug($slugObject)->first();
                if (!is_null($category)) {
                    $slugObjectTranslated = $category->getTranslation('slug', $locale);
                    if (!is_null($slugEntityObject)) {
                        $slugEntityObjectTranslated = BlogArticle::whereSlug($slugEntityObject)->first()->getTranslation('slug', $locale);
                    }
                }
            }
        }

        $originalLanguage = LaravelLocalization::getCurrentLocale();
        LaravelLocalization::setLocale($locale);
        $urlTranslated = makeUrl($pageName, $slugObjectTranslated, $slugEntityObjectTranslated);
        LaravelLocalization::setLocale($originalLanguage);
        return $urlTranslated;
    }


    public static function urlLastSegment($url)
    {
        return $url->segment(count(request()->segments()));
    }

    public static function getSegments($url)
    {
        $localesArray = array_keys(LaravelLocalization::getLocalesOrder());
        $segments = $url->segments();
        if (isset($segments[0]) && in_array($segments[0], $localesArray)) {
            unset($segments[0]);
        }
        return array_values($segments);
    }

    public static function getUrlTranslateds($page, $pageSlug)
    {
        $urlTranslateds = [];
        $arrayLocales = array_keys(LaravelLocalization::getSupportedLocales());

        foreach ($arrayLocales as $locale) {
            if (LaravelLocalization::getCurrentLocale() != $locale) {
                $urlTranslated = "#";
                if (urlLastSegment(request()) !== $page->slug && $pageSlug != "home") {
                    $segments = getSegments(request());
                    if (count($segments)) {
                        $urlTranslated = translateUrl($locale, $page->name, $segments[1] ?? null, $segments[2] ?? null);
                    }
                } elseif (isset($pageSlug)) {
                    $urlTranslated = getRouteBySlug($pageSlug, $locale);
                }
                $urlTranslateds[$locale] = $urlTranslated;
            }
        }

        return $urlTranslateds;
    }

    public static function checkIfPageRequireAuthentication($page)
    {
        foreach ($page->getPageTree() as $pageInTree) {
            if ($pageInTree->auth_required) {
                return true;
            }
        }
        return false;
    }

    public static function renderView($blade, $arg = null)
    {
        //Example: $this->renderView('entity.home', compact('collection', 'otherCollection')),
        $data = [];
        foreach ($arg as $key => $var) {
            $data[$key] = $var;
        }
        return view($blade, $data)->render();
    }

    public static function getPageByName($name)
    {
        return Page::where('name', $name)->first();
    }

    public static function getResourcePage($page)
    {
        return (new PageResource($page))->toDTO();
    }

    public static function getSocialNetworkIcon($name): string
    {
        return SocialNetworksEnum::getIcon($name);
    }
}
