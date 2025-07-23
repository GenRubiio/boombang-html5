<?php

namespace App\Models;

use App\Traits\Observers\CacheClearObservantTrait;
use App\Traits\Observers\ModelObservantTrait;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class SocialNetwork extends Model
{
    use CrudTrait;
    use HasTranslations;
    use ModelObservantTrait;
    use CacheClearObservantTrait;
    use SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'social_networks';
    protected $primaryKey = 'id';
    public $timestamps = true;
    // protected $guarded = ['id'];
    protected $fillable = [
        'name',
        'link',
        'icon',
        'image',
        'parent_id',
        'lft',
        'rgt',
        'depth',
        'active',
        'deleted_user'
    ];
    protected $translatable = [
        'name',
        'link'
    ];
    // protected $fakeColumns = [];
    // protected $hidden = [];
    // protected $dates = [];

    public const FILES_DESTINATION_PATH = "uploads/social-networks";

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

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where($this->table . '.active', 1);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy($this->table . '.lft', 'asc')->orderBy($this->table . '.id', 'desc');
    }
    /* Has featured and featured_order fields
        public function scopeOrdered($query)
        {
            return $query->orderByRaw("{$this->table}.featured DESC")
                ->orderBy($this->table . '.featured_order', 'asc')
                ->orderBy($this->table . '.lft', 'asc')
                ->orderBy($this->table . '.id', 'desc');
        }
    */

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? url($this->image) : null;
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    public function setImageAttribute($value)
    {
        $attributeName = "image";
        $destinationPath = self::FILES_DESTINATION_PATH;
        $filename = Str::slug($this->name);
        $this->attributes[$attributeName] = genericImageMutator(entity: $this, value: $value, destination: $destinationPath, filename: $filename, attribute: $attributeName);
    }
}
