<?php

namespace App\Models;

use App\Traits\Observers\CacheClearObservantTrait;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Backpack\MenuCRUD\app\Models\MenuItem as MenuItemOriginal;
use App\Traits\Observers\ModelObservantTrait;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class MenuItem extends MenuItemOriginal
{
    use CrudTrait;
    use HasTranslations;
    use ModelObservantTrait;
    use CacheClearObservantTrait;
    use SoftDeletes;

    protected $table = 'menu_items';
    protected $fillable = [
        'name',
        'type',
        'link',
        'image',
        'menu_top',
        'menu_top_order',
        'menu_footer',
        'menu_footer_order',
        'menu_legal',
        'menu_legal_order',
        'page_id',
        'active',
        'parent_id',
        'lft',
        'rgt',
        'depth',
        'deleted_user'
    ];
    protected $translatable = [
        'name',
        'link'
    ];
    public $ai = [
        'name'
    ];
    protected $upload_path = 'uploads/menu-item';

    /*
    |--------------------------------------------------------------------------
    | FUNCTIONS
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function parent()
    {
        return $this->belongsTo(MenuItem::class, 'parent_id')->active();
    }

    public function children()
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->active();
    }

    public function page()
    {
        return $this->belongsTo(Page::class, 'page_id')->active();
    }

    public function getTranslatable()
    {
        return $this->translatable;
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeMenuTop($query)
    {
        return $query->where($this->table . '.menu_top', 1)
            ->orderBy($this->table . '.menu_top_order', 'asc');
    }

    public function scopeMenuFooter($query)
    {
        return $query->where($this->table . '.menu_footer', 1)
            ->orderBy($this->table . '.menu_footer_order', 'asc');
    }

    public function scopeMenuLegal($query)
    {
        return $query->where($this->table . '.menu_legal', 1)
            ->orderBy($this->table . '.menu_legal_order', 'asc');
    }

    public function scopeActive($query)
    {
        return $query->where($this->table . '.active', 1);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy($this->table . '.lft', 'asc');
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */
    public function getPageLinkAttribute()
    {
        if (!is_null($this->page_id) && $this->type != "external_link") {
            return makeUrl($this->page->name ?? 'Home');
        }
        return $this->link;
    }

    /**
     * Get all menu items, in a hierarchical collection.
     * Only supports 2 levels of indentation.
     */
    public static function getTree()
    {
        $menu = self::orderBy('lft')->get();

        if ($menu->count()) {
            foreach ($menu as $k => $menu_item) {
                $menu_item->children = collect([]);

                foreach ($menu as $i => $menu_subitem) {
                    if ($menu_subitem->parent_id == $menu_item->id) {
                        $menu_item->children->push($menu_subitem);

                        // remove the subitem for the first level
                        $menu = $menu->reject(function ($item) use ($menu_subitem) {
                            return $item->id == $menu_subitem->id;
                        });
                    }
                }
            }
        }

        return $menu;
    }

    public function url()
    {
        switch ($this->type) {
            case 'external_link':
                return $this->link ?? '';

            case 'internal_link':
                return url($this->link ?? '#');

            default: //page_link
                return optional($this->page)->url ?? '';
        }
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    public function setImageAttribute($value)
    {
        $attributeName = "image";
        $disk = "uploads";
        $destinationPath = $this->upload_path . '/' . Str::slug($this->name);

        if ($value == null) {
            if (isset($this->{$attributeName}) && $this->{$attributeName} != null) {
                removeFile($this->{$attributeName}, $disk);
            }
            $this->attributes[$attributeName] = null;
        }
        if (Str::startsWith($value, 'data:image')) {
            $image = Image::make($value);
            $extension = getExtensionByMimetype($image->mime());
            $filename = Str::slug($this->name) . '-vertical' . $extension;
            resizeImage($image, 400, 800);
            saveImage($disk, $destinationPath . '/' . $filename, $image);

            $this->attributes[$attributeName] = $destinationPath . '/' . $filename;
        }
    }
}
