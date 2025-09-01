<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Intervention\Image\Facades\Image;
use App\Services\External\SchemaService;
use Illuminate\Database\Eloquent\Builder;
use Cviebrock\EloquentSluggable\Sluggable;
use App\Traits\Observers\PageObservantTrait;
use App\Traits\Observers\SlugObservantTrait;
use App\Traits\Observers\ModelObservantTrait;
use Illuminate\Database\Eloquent\SoftDeletes;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use App\Traits\Observers\GalleryObservantTrait;
use App\Traits\Observers\SitemapObservantTrait;
use App\Traits\Observers\CacheClearObservantTrait;
use Cviebrock\EloquentSluggable\SluggableScopeHelpers;
use Backpack\PageManager\app\Models\Page as BackpackPage;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;

class Page extends BackpackPage
{
    use CrudTrait;
    use Sluggable;
    use SluggableScopeHelpers;
    use HasTranslations;
    use ModelObservantTrait;
    use PageObservantTrait;
    //use SitemapObservantTrait;
    use SoftDeletes;
    //use GalleryObservantTrait;
    use SlugObservantTrait;
    use CacheClearObservantTrait;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'pages';
    protected $primaryKey = 'id';
    public $timestamps = true;
    // protected $guarded = ['id'];
    protected $fillable = [
        'template',
        'name',
        'auth_required',
        'exists_blade',
        'title',
        'content',
        'content_no_translatable',
        'extras',
        'extras_no_translatable',
        'main_image',
        'og_image',
        'tw_image',
        'parent_id',
        'lft',
        'rgt',
        'depth',
        'active',
        'slug',
        'deleted_user'
    ];
    protected $translatable = [
        'title',
        'content',
        'slug',
        'extras'
    ];
    public $ai = [
        'title',
        'slug',
        'content.content_title',
        'content.content_content',
        'extras.page_title',
        'extras.meta_title',
        'extras.meta_description',
        'extras.meta_keywords',
        'extras.og_title',
        'extras.og_description',
        'extras.tw_title',
        'extras.tw_description'
    ];

    // protected $hidden = [];
    // protected $dates = [];
    protected $fakeColumns = [
        'content',
        'content_no_translatable',
        'extras',
        'extras_no_translatable'
    ];
    protected $casts = [
        //'content_no_translatable' => 'array',
        //'extras_no_translatable' => 'array',
    ];

    public const FILES_DESTINATION_PATH = "uploads/pages";

    /**
     * Return the sluggable configuration array for this model.
     *
     * @return array
     */
    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'slug_or_title',
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | FUNCTIONS
    |--------------------------------------------------------------------------
    */
    public function getTranslatable()
    {
        return $this->translatable;
    }

    public function getTemplateName()
    {
        return str_replace('_', ' ', Str::title($this->template));
    }

    public function getPageLink()
    {
        return url($this->slug);
    }

    public function getOpenButton()
    {
        return '<a class="btn btn-sm btn-link" href="' . $this->getPageLink() . '" target="_blank">' .
            '<i class="fa fa-eye"></i> ' . trans('backpack::pagemanager.open') . '</a>';
    }

    public function getPageTree()
    {
        $parents = [];
        $parent = $this;

        while (!is_null($parent->parentPage)) {
            $parents[] = $parent->parentPage;
            $parent = $parent->parentPage;
        }

        $parents = array_reverse($parents);
        $parents[] = $this;
        return $parents;
    }

    public function schema()
    {
        return app(SchemaService::class)->generatePageSchema($this);
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */
    public function parentPage()
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    public function images()
    {
        return $this->galleries()->image();
    }

    public function videos()
    {
        return $this->galleries()->video();
    }

    public function files()
    {
        return $this->galleries()->file();
    }

    public function galleries()
    {
        return $this->morphMany(Gallery::class, 'galleryable')->active();
    }

    public function imagesHeader()
    {
        return $this->images()->type('header')->get();
    }

    public function imagesContent()
    {
        return $this->images()->type('content')->get();
    }

    public function imagesExtra()
    {
        return $this->images()->type('extra')->get();
    }

    /*For Backend*/
    public function allImages()
    {
        return $this->allGalleries()->image();
    }

    public function allVideos()
    {
        return $this->allGalleries()->video();
    }

    public function allFiles()
    {
        return $this->allGalleries()->file();
    }

    public function allGalleries()
    {
        return $this->morphMany(Gallery::class, 'galleryable');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */
    // @override method add Builder type to $scope parameter fix bug scopeWhereSlug compatible
    /**
     * Query scope for finding a model by its primary slug.
     *
     * @param \Illuminate\Database\Eloquent\Builder $scope
     * @param string $slug
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWhereSlug(Builder $scope, string $slug): Builder
    {
        return $scope->where($this->getSlugKeyName() . '->' . $this->getLocale(), $slug);
    }

    public function scopeActive($query)
    {
        return $query->where($this->table . '.active', 1);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy($this->table . '.lft', 'asc')->orderBy($this->table . '.id', 'asc');
    }

    public function scopeAuthenticationRequired($query)
    {
        return $query->where($this->table . '.auth_required', 1);
    }

    public function scopeSitemapIndexable($query)
    {
        return $query->where('sitemap_indexable', 1);
    }

    public function scopeFindByName($query, $name)
    {
        return $query->active()->whereName($name);
    }

    /*
     * Métodos extensibles de Cviebrock\EloquentSluggable\Sluggable, pero con el scope de active añadido
     */
    public function scopeFindSlugOrFail($query, $slug, $parent = null)
    {
        return $query->active()->whereSlug($slug)
            ->when(!is_null($parent), function ($query) use ($parent) {
                $query->where('parent_id', $parent);
            })
            ->firstOrFail()->withFakes();
    }

    public function scopeFindSlug($query, $slug, $parent = null)
    {
        return $query->active()->whereSlug($slug)
            ->when(!is_null($parent), function ($query) use ($parent) {
                $query->where('parent_id', $parent);
            })
            ->first()->withFakes();
    }


    /*
    |--------------------------------------------------------------------------
    | ACCESORS
    |--------------------------------------------------------------------------
    */

    public function getMainImageUrlAttribute(): ?string
    {
        return $this->main_image ? url($this->main_image) : null;
    }

    public function getOgImageUrlAttribute(): ?string
    {
        if (!empty($this->og_image)) {
            return url($this->og_image);
        }
        return $this->main_image ? url($this->main_image) : null;
    }

    public function getTwImageUrlAttribute(): ?string
    {
        if (!empty($this->tw_image)) {
            return url($this->tw_image);
        }
        return $this->main_image ? url($this->main_image) : null;
    }

    public function getExtrasDecodedAttribute()
    {
        return json_decode($this->extras ?? json_encode([]));
    }

    public function getExtrasNoTranslatableDecodedAttribute()
    {
        return json_decode($this->extras_no_translatable ?? json_encode([]));
    }

    public function getContentNoTranslatableDecodedAttribute()
    {
        $contentNoTranslatableDecoded = (array)json_decode($this->content_no_translatable);
        foreach ($contentNoTranslatableDecoded as $key => $value) {
            if (!empty($value) && (str_ends_with($key, '_logo') || str_ends_with($key, '_image') || str_ends_with($key, '_icon'))) {
                $contentNoTranslatableDecoded[$key] = url($value);
            }
        }
        if (!isset($contentNoTranslatableDecoded['header_tablet_image']) || empty($contentNoTranslatableDecoded['header_tablet_image'])) {
            $contentNoTranslatableDecoded['header_tablet_image'] = $contentNoTranslatableDecoded['header_image'] ?? '';
        }
        if (!isset($contentNoTranslatableDecoded['header_mobile_image']) || empty($contentNoTranslatableDecoded['header_mobile_image'])) {
            $contentNoTranslatableDecoded['header_mobile_image'] = $contentNoTranslatableDecoded['header_tablet_image'] ?? '';
        }
        return $contentNoTranslatableDecoded;
    }

    public function getContentDecodedAttribute()
    {
        $contentDecoded = (array)json_decode($this->content);
        foreach ($contentDecoded as $key => $value) {
            if (!empty($value) && (str_ends_with($key, '_logo') || str_ends_with($key, '_image') || str_ends_with($key, '_icon'))) {
                $contentDecoded[$key] = url($value);
            }
        }
        return $contentDecoded;
    }

    // The slug is created automatically from the "name" field if no slug exists.
    public function getSlugOrTitleAttribute()
    {
        if ($this->slug != '') {
            return $this->slug;
        }

        return $this->title;
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    public function setMainImageAttribute($value)
    {
        $attributeName = "main_image";
        $destinationPath = self::FILES_DESTINATION_PATH . "/" . Str::slug($this->name);
        $filename = Str::slug($this->title);
        $this->attributes[$attributeName] = genericImageMutator(entity: $this, value: $value, destination: $destinationPath, filename: $filename, attribute: $attributeName, acceptSvg: false);
    }

    public function setOgImageAttribute($value)
    {
        $attributeName = "og_image";
        $destinationPath = self::FILES_DESTINATION_PATH . "/" . Str::slug($this->name);
        $filename = Str::slug($this->title) . '-og-image';
        $this->attributes[$attributeName] = genericImageMutator(entity: $this, value: $value, destination: $destinationPath, filename: $filename, attribute: $attributeName, acceptSvg: false);
    }

    public function setTwImageAttribute($value)
    {
        $attributeName = "tw_image";
        $destinationPath = self::FILES_DESTINATION_PATH . "/" . Str::slug($this->name);
        $filename = Str::slug($this->title) . '-tw-image';
        $this->attributes[$attributeName] = genericImageMutator(entity: $this, value: $value, destination: $destinationPath, filename: $filename, attribute: $attributeName, acceptSvg: false);
    }

    public function setContentAttribute($value)
    {
        $attributeName = "content";
        $value = (array)$value;
        foreach ($value as $key => $fieldValue) {
            if (str_ends_with($key, 'repeatable')) {
                $value[$key] = $this->saveRepeatableAttribute($fieldValue);
            }
            if (str_ends_with($key, 'logo') || str_ends_with($key, 'image') || str_ends_with($key, 'icon')) {
                $value[$key] = $this->saveImgInFakeField($fieldValue, $key);
            }
        }

        $this->attributes[$attributeName] = $value;
    }

    public function saveRepeatableAttribute($value)
    {
        $value = (array)$value;
        foreach ($value as $characteristicKey => $item) {
            $name = "item";
            foreach ($item as $key => $fieldValue) {
                if (str_ends_with($key, 'title') || str_ends_with($key, 'name')) {
                    $name = $fieldValue;
                }
                if (str_ends_with($key, 'logo') || str_ends_with($key, 'image') || str_ends_with($key, 'icon')) {
                    $value[$characteristicKey][$key] = $this->saveImgInFakeField($fieldValue, $key, name: $name);
                }
            }
        }
        return $value;
    }

    public function setContentNoTranslatableAttribute($value)
    {
        $attributeName = "content_no_translatable";

        $value = (array)json_decode($value);
        foreach ($value as $key => $fieldValue) {
            if (str_ends_with($key, 'logo') || str_ends_with($key, 'image') || str_ends_with($key, 'icon')) {
                $value[$key] = $this->saveImgInFakeField($fieldValue, $key);
            }
        }

        $this->attributes[$attributeName] = json_encode($value);
    }

    public function saveImgInFakeField($value, $attributeName, $withLanguage = false, $name = "")
    {
        $disk = "uploads";
        $destinationPath = "uploads/pages/" . Str::slug($this->name);

        // if the image was erased
        if ($value == null) {
            // delete the image from disk
            //removeFile($this->{$attributeName}, $disk);

            // set null in the database column
            return null;
        }

        $filename = Str::slug($this->title . ' ' . $attributeName);
        if ($name) {
            $filename .= '-' . Str::slug($name);
        }
        if ($withLanguage) {
            $filename .= '-' . LaravelLocalization::getCurrentLocale();
        }
        // if a base64 was sent, store it in the db
        if (Str::startsWith($value, 'data:image/svg+xml')) {
            $filename = $filename . '.svg';
            $value = str_replace('data:image/svg+xml;base64,', '', $value);
            $value = str_replace(' ', '+', $value);
            if (!File::exists($destinationPath)) {
                mkdir($destinationPath);
            }
            File::put($destinationPath . '/' . $filename, base64_decode($value));
            return $destinationPath . '/' . $filename;
        } elseif (Str::startsWith($value, 'data:image/webp')) {
            $filename = $filename . '.webp';
            $path = $destinationPath . '/' . $filename;
            $value = str_replace('data:image/webp;base64,', '', $value);
            $value = str_replace(' ', '+', $value);
            if (!File::exists($destinationPath)) {
                mkdir($destinationPath);
            }
            File::put($path, base64_decode($value));
            return $path;
        } elseif (Str::startsWith($value, 'data:image')) {
            // 0. Make the image
            $image = Image::make($value);
            $extension = getExtensionByMimetype($image->mime());
            // 1. Generate a filename.
            $filename = $filename . $extension;
            // 2. Store the image on disk.
            //Optimize max size and save
            resizeImage($image, null, null);
            saveImage($disk, $destinationPath . '/' . $filename, $image);

            // 3. Save the path to the database
            return $destinationPath . '/' . $filename;

            // 4. Generate mobile & thumbnail image
            //generateMobileImage($disk, $image, $filename, $destinationPath);
            //generateThumbnailImage($disk, $image, $filename, $destinationPath);
        }

        // Return original value
        return $value;
    }
}
