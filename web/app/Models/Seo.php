<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Observers\CacheClearObservantTrait;
use App\Traits\Observers\ModelObservantTrait;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;

class Seo extends Model
{
    use SoftDeletes;
    use HasTranslations;
    use ModelObservantTrait;
    use CacheClearObservantTrait;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'seos';
    protected $primaryKey = 'id';
    public $timestamps = true;
    // protected $guarded = ['id'];
    protected $fillable = [
        'seoable_id',
        'seoable_type',
        'seo_title',
        'seo_breadcrumb',
        'url_canonical',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_title',
        'og_description',
        'og_image',
        'tw_title',
        'tw_description',
        'tw_image',
        'noindex_nofollow',
        'sitemap_indexable',
        'sitemap_priority',
        'sitemap_frequency',
    ];
    // protected $hidden = [];
    // protected $dates = [];
    protected $translatable = [
        'seo_title',
        'seo_breadcrumb',
        'url_canonical',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_title',
        'og_description',
        'tw_title',
        'tw_description',
    ];
    // protected $casts = [];
    public static function boot()
    {
        parent::boot();
        static::retrieved(function ($model) {
            $model->createGetterFillables();
        });
        static::updating(function ($model) {
            foreach ($model->attributes as $key => $value) {
                if (Str::endsWith($key, '_getter')) {
                    unset($model->attributes[$key]);
                }
            }
        });
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

    public function seoable()
    {
        return $this->morphTo();
    }

    private function createGetterFillables()
    {
        foreach ($this->seoable->seoAttributes as $attr => $value) {
            if (empty($this->{$attr})) {
                $this->{$attr . '_getter'} = strip_tags($this->seoable->{$value});
            } else {
                $this->{$attr . '_getter'} = $this->{$attr};
            }
        }
        return $this;
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | ACCESORS
    |--------------------------------------------------------------------------
    */

    public function getOgImageUrlAttribute(): ?string
    {
        return $this->og_image ? url($this->og_image) : null;
    }

    public function getTwImageUrlAttribute(): ?string
    {
        return $this->tw_image ? url($this->tw_image) : null;
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    public function setOgImageAttribute($value)
    {
        $seoableType = explode('\\', $this->seoable_type);
        $entity = strtolower(end($seoableType));
        $attributeName = "og_image";
        $disk = "uploads";
        $destinationPath = "uploads/seo/{$entity}-{$this->seoable_id}";
        // if the image was erased
        if ($value == null) {
            // delete the image from disk
            if (!empty($this->{$attributeName}) && Storage::disk($disk)->exists($this->{$attributeName})) {
                removeFile($this->{$attributeName}, $disk);
            }
            // set null in the database column
            $this->attributes[$attributeName] = null;
        }

        // if a base64 was sent, store it in the db
        if (Str::startsWith($value, 'data:image')) {
            // 0. Make the image
            $image = Image::make($value);
            $extension = getExtensionByMimetype($image->mime());
            // 1. Generate a filename.
            $filename = $this->seoable_id . '-og' . $extension;
            // 2. Store the image on disk.
            //Optimize max size and save
            resizeImage($image, null, null);
            saveImage($disk, $destinationPath . '/' . $filename, $image);

            // 3. Save the path to the database
            $this->attributes[$attributeName] = $destinationPath . '/' . $filename;

            // 4. Generate mobile & thumbnail image
            //generateMobileImage($disk, $image, $filename, $destinationPath);
            //generateThumbnailImage($disk, $image, $filename, $destinationPath);
        }
    }

    public function setTwImageAttribute($value)
    {
        $seoableType = explode('\\', $this->seoable_type);
        $entity = strtolower(end($seoableType));
        $attributeName = "tw_image";
        $disk = "uploads";
        $destinationPath = "uploads/seo/{$entity}-{$this->seoable_id}";
        // if the image was erased
        if ($value == null) {
            // delete the image from disk
            if (!empty($this->{$attributeName}) && Storage::disk($disk)->exists($this->{$attributeName})) {
                removeFile($this->{$attributeName}, $disk);
            }
            // set null in the database column
            $this->attributes[$attributeName] = null;
        }

        // if a base64 was sent, store it in the db
        if (Str::startsWith($value, 'data:image')) {
            // 0. Make the image
            $image = Image::make($value);
            $extension = getExtensionByMimetype($image->mime());
            // 1. Generate a filename.
            $filename = $this->seoable_id . '-tw' . $extension;
            // 2. Store the image on disk.
            //Optimize max size and save
            resizeImage($image, null, null);
            saveImage($disk, $destinationPath . '/' . $filename, $image);

            // 3. Save the path to the database
            $this->attributes[$attributeName] = $destinationPath . '/' . $filename;

            // 4. Generate mobile & thumbnail image
            //generateMobileImage($disk, $image, $filename, $destinationPath);
            //generateThumbnailImage($disk, $image, $filename, $destinationPath);
        }
    }
}
