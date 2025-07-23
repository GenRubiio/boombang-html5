<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Carbon\Carbon;
use Cviebrock\EloquentSluggable\Sluggable;
use Cviebrock\EloquentSluggable\SluggableScopeHelpers;
use Illuminate\Database\Eloquent\Model;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Observers\ModelObservantTrait;
use Illuminate\Support\Str;
use App\Traits\Observers\SlugObservantTrait;
use App\Traits\Observers\SitemapObservantTrait;
use App\Traits\Observers\CacheClearObservantTrait;

class BlogArticle extends Model
{
    use CrudTrait;
    use Sluggable;
    use SluggableScopeHelpers;
    use SoftDeletes;
    use HasTranslations;
    use ModelObservantTrait;
    use SlugObservantTrait;
    use SitemapObservantTrait;
    use CacheClearObservantTrait;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'blog_articles';
    protected $primaryKey = 'id';
    public $timestamps = true;
    // protected $guarded = ['id'];
    protected $fillable = [
        'title',
        'extract',
        'content',
        'image',
        'status',
        'category_id',
        'slug',
        'featured',
        'date',
        'deleted_user'
    ];
    // protected $hidden = [];
    // protected $dates = [];
    protected $casts = [
        'featured' => 'boolean',
        'date' => 'datetime',
    ];
    protected $translatable = [
        'title',
        'extract',
        'content',
        'slug'
    ];

    public const FILES_DESTINATION_PATH = "uploads/blog-articles";

    /**
     * The columns of the full text index
     */
    /*
    use App\Traits\Observers\FullTextSearchObservantTrait;
    use FullTextSearchObservantTrait;
    protected $searchable = [
        'search_terms'
    ];
    const SEARCHABLE_WITH_LANGUAGES = false;
    */

    /**
     * The columns of the fill search_terms
     */
    /*
    const SEARCHABLE_FIELDS = [
        'name',
        'description',
        'overview',
        'content',
    ];
    */

    /**
     * Return the sluggable configuration array for this model.
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

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function blogCategory()
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    public function blogTags()
    {
        return $this->belongsToMany(BlogTag::class, 'blog_article_tag', 'blog_article_id', 'blog_tag_id');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */
    public function scopeWhereSlug($query, $slug)
    {
        return $query->where($this->getSlugKeyName() . '->' . $this->getLocale(), $slug);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'Publicada');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'Borrador');
    }

    public function scopeFeatured($query)
    {
        return $query->where($this->table . '.featured', 1);
    }

    public function scopeDatePast($query)
    {
        return $query->where('date', '<=', Carbon::now())->orderBy('date', 'DESC');
    }

    public function scopeWhereCategory($query, $categoryId)
    {
        return $query->whereHas('blogCategory', function ($query) use ($categoryId) {
            return $query->where('blog_categories.id', $categoryId)->active();
        });
    }

    public function scopeWhereTags($query, $tags)
    {
        return $query->whereHas('blogTags', function ($query) use ($tags) {
            return $query->whereIn('blog_tag_id', $tags)->active();
        });
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESORS
    |--------------------------------------------------------------------------
    */

    // The slug is created automatically from the "title" field if no slug exists.
    public function getSlugOrTitleAttribute(): string
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

    public function setImageAttribute($value)
    {
        $attributeName = "image";
        $destinationPath = self::FILES_DESTINATION_PATH . "/" . Str::slug($this->title);
        $filename = Str::slug($this->title);
        $this->attributes[$attributeName] = genericImageMutator(entity: $this, value: $value, destination: $destinationPath, filename: $filename, attribute: $attributeName, acceptSvg: false);
    }
}
