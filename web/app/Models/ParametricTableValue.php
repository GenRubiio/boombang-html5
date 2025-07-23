<?php

namespace App\Models;

use App\Scopes\ParametricTableScope;
use App\Traits\Observers\CacheClearObservantTrait;
use App\Traits\Observers\GenerateStringIdObservantTrait;
use App\Traits\Observers\ModelObservantTrait;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\SoftDeletes;

class ParametricTableValue extends Model
{
    use CrudTrait;
    use HasTranslations;
    use ModelObservantTrait;
    use CacheClearObservantTrait;
    use GenerateStringIdObservantTrait;
    use SoftDeletes;

    protected static function boot()
    {
        parent::boot();
        static::addGlobalScope(new ParametricTableScope());
    }

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'parametric_table_values';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $guarded = ['id'];
    protected $fillable = [
        'parametric_table_id',
        'name',
        'description',
        'value',
        'resource',
        'visible',
        'active',
        'parent_id',
        'lft',
        'rgt',
        'depth',
    ];
    public $parametricTableId = null;
    protected $translatable = ['value'];
    // protected $hidden = [];
    // protected $dates = [];
    protected $casts = [
        'id' => 'string'
    ];

    /*
    |--------------------------------------------------------------------------
    | FUNCTIONS
    |--------------------------------------------------------------------------
    */

    public function generateIdFromField(): array
    {
        return [
            $this->parametricTable->table_name,
            $this->name,
        ];
    }

    public function getParametricTableId()
    {
        return ParametricTable::where('id', $this->parametricTableId)
            ->first()
            ->id;
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function parametricTable()
    {
        return $this->belongsTo(ParametricTable::class, 'parametric_table_id')
            ->tableId($this->parametricTableId);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where($this->table . '.active', 1);
    }

    public function scopeVisible($query)
    {
        return $query->where($this->table . '.visible', 1);
    }

    public function scopeResource($query)
    {
        return $query->where($this->table . '.resource', 1);
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
