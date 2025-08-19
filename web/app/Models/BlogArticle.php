<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use App\Services\External\SchemaService;
use Cviebrock\EloquentSluggable\Sluggable;
use App\Traits\Observers\SeoObservantTrait;
use App\Traits\Observers\SlugObservantTrait;
use App\Traits\Observers\ModelObservantTrait;
use Illuminate\Database\Eloquent\SoftDeletes;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use App\Traits\Observers\SitemapObservantTrait;
use App\Traits\Observers\CacheClearObservantTrait;
use Cviebrock\EloquentSluggable\SluggableScopeHelpers;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;

class BlogArticle extends Model
{
    use CrudTrait;
    use Sluggable;
    use SluggableScopeHelpers;
    use SoftDeletes;
    use HasTranslations;
    use ModelObservantTrait;
    use SlugObservantTrait;
    //use SitemapObservantTrait;
    use CacheClearObservantTrait;
    use SeoObservantTrait;

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

    public $seoTitleAttr = [
        'title'
    ];
    public $seoAttributes = [
        'seo_title' => 'title',
        'seo_breadcrumb' => 'title',
        'meta_title' => 'title',
        'meta_description' => 'title',
        'og_title' => 'title',
        'og_description' => 'title',
        'og_image_url' => 'image_url',
        'tw_title' => 'title',
        'tw_description' => 'title',
        'tw_image_url' => 'image_url',
    ];

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

    public function seo()
    {
        return $this->morphOne(Seo::class, 'seoable');
    }

    public function schema()
    {
        $homePage = Page::where('name', 'Home')->first();
        $blogPage = Page::where('name', 'News')->first();
        $parts = [
            app(SchemaService::class)->generateBlogArticleSchema($this),
            app(SchemaService::class)->generateBreadcrumbSchema([
                ['name' => $homePage->title, 'url' => makeUrl($homePage->slug)],
                ['name' => $blogPage->title, 'url' => makeUrl($blogPage->slug)],
                ['name' => $this->title, 'url' => url()->current()],
            ]),
        ];
        return implode("\n", array_filter($parts));
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
