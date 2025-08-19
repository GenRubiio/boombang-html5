<?php

namespace App\Services\External;

use App\Models\Page;
use App\Models\BlogArticle;
use Spatie\SchemaOrg\Schema;
use Illuminate\Database\Eloquent\Model;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;
use Illuminate\Support\Str;

class SchemaService
{
    public function generatePageSchema(Page $page): string
    {
        return cache()->remember("schema:page:{$page->id}:" . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), env('CACHE_DEFAULT_TTL', 7200), function () use ($page) {
            $extras = json_decode($page->extras);
            $schema = Schema::webPage();
            if (!empty($page->title)) {
                $schema->name($page->title);
            }
            if (!empty($extras->meta_description)) {
                $schema->description($extras->meta_description);
            }
            $schema->url(url()->current());
            if ($lang = app()->getLocale()) {
                $schema->inLanguage($lang);
            }
            if (!empty($page->og_image)) {
                $schema->primaryImageOfPage(Schema::imageObject()->url(asset($page->og_image)));
            }
            if (!empty($page->updated_at)) {
                $schema->dateModified($page->updated_at->toIso8601String());
            }
            $schema->isPartOf(
                Schema::webSite()
                    ->name(config('settings.name'))
                    ->url(config('settings.url'))
            );
            return $schema->toScript();
        });
    }

    public function generateObjectSchema(Model $model): string
    {
        $modelCamel = Str::camel(class_basename($model));
        return cache()->remember("schema:object:{$modelCamel}:" . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), env('CACHE_DEFAULT_TTL', 7200), function () use ($model) {
            $schema = Schema::webPage();
            $seo = $model->seo ?? null;
            if (!empty($model->title)) {
                $schema->name($model->title);
            }
            if (!empty($seo->meta_description)) {
                $schema->description($seo->meta_description);
            }
            $schema->url(url()->current());
            if ($lang = app()->getLocale()) {
                $schema->inLanguage($lang);
            }
            if (!empty($seo->og_image)) {
                $schema->primaryImageOfPage(Schema::imageObject()->url(asset($seo->og_image)));
            }
            if (!empty($model->updated_at)) {
                $schema->dateModified($model->updated_at->toIso8601String());
            }
            $schema->isPartOf(
                Schema::webSite()
                    ->name(config('settings.name'))
                    ->url(config('settings.url'))
            );
            return $schema->toScript();
        });
    }

    public function generateBlogArticleSchema(BlogArticle $blogArticle): string
    {
        return cache()->remember("schema:article:{$blogArticle->id}:" . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), env('CACHE_DEFAULT_TTL', 7200), function () use ($blogArticle) {
            $schema = Schema::blogPosting();
            if (!empty($blogArticle->title)) {
                $schema->headline($blogArticle->title);
            }
            if (!empty($blogArticle->extract)) {
                $schema->description(strip_tags($blogArticle->extract));
            }
            if (!empty($blogArticle->image)) {
                $schema->image(Schema::imageObject()->url(asset($blogArticle->image)));
            }
            if (!empty($blogArticle->created_at)) {
                $schema->datePublished($blogArticle->created_at->toIso8601String());
            }
            if (!empty($blogArticle->updated_at)) {
                $schema->dateModified($blogArticle->updated_at->toIso8601String());
            }
            if ($blogArticle->author && !empty($blogArticle->author->name)) {
                $schema->author(
                    Schema::person()->name($blogArticle->author->name)
                );
            }
            $organization = Schema::organization()->name(config('app.name'));
            if ($logo = config('settings.logo')) {
                $organization->logo(Schema::imageObject()->url(asset($logo)));
            }
            $schema->publisher($organization);
            $schema->mainEntityOfPage(
                Schema::webPage()->identifier(url()->current())
            );
            return $schema->toScript();
        });
    }


    public function generateLocalBusinessSchema(): string
    {
        return cache()->remember("schema:local_business:" . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), env('CACHE_DEFAULT_TTL', 7200), function () {
            $business = Schema::localBusiness()
                ->name(config('settings.name'))
                ->url(config('app.url'));
            if ($image = config('settings.logo')) {
                $business->image(Schema::imageObject()->url(asset($image)));
            }
            if (config('settings.phone')) {
                $business->telephone(config('settings.phone'));
            }
            if (config('settings.has_address')) {
                $address = Schema::postalAddress();
                if ($street = config('settings.address_street')) {
                    $address->streetAddress($street);
                }
                if ($city = config('settings.address_city')) {
                    $address->addressLocality($city);
                }
                if ($region = config('settings.address_region')) {
                    $address->addressRegion($region);
                }
                if ($postalCode = config('settings.address_postal_code')) {
                    $address->postalCode($postalCode);
                }
                if ($country = config('settings.address_country')) {
                    $address->addressCountry($country);
                }
                $business->address($address);
            }
            if (config('settings.opening_hours')) {
                $business->openingHours(config('settings.opening_hours'));
            }
            if (config('settings.price_range')) {
                $business->priceRange(config('settings.price_range'));
            }
            return $business->toScript();
        });
    }

    public function generateBreadcrumbSchema(array $items = []): ?string
    {
        if (count($items) < 2) {
            return null;
        }
        $list = Schema::breadcrumbList();
        $position = 1;
        $elements = [];

        foreach ($items as $it) {
            if (empty($it['name']) || empty($it['url'])) continue;
            $elements[] = Schema::listItem()
                ->position($position++)
                ->item(
                    Schema::thing()
                        ->setProperty('@id', $it['url'])
                        ->name($it['name'])
                );
        }
        if (!$elements) return null;
        $list->itemListElement($elements);
        return $list->toScript();
    }
}
