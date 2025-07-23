<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Observers\ModelObservantTrait;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use App\Traits\Observers\CacheClearObservantTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;

class Cookie extends Model
{
    use CrudTrait;
    use HasFactory;
    use HasTranslations;
    use ModelObservantTrait;
    use CacheClearObservantTrait;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'cookies';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $guarded = ['id'];
    protected $fillable = [
        'category',
        'name',
        'description',
        'duration',
        'parent_id',
        'lft',
        'rgt',
        'depth',
        'active',
    ];
    // protected $hidden = [];
    // protected $dates = [];
    protected $translatable = [
        'description',
    ];

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

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */
}
