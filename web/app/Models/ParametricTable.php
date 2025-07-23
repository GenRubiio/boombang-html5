<?php

namespace App\Models;

use App\Traits\Observers\CacheClearObservantTrait;
use App\Traits\Observers\GenerateStringIdObservantTrait;
use App\Traits\Observers\ModelObservantTrait;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;

class ParametricTable extends Model
{
    use CrudTrait;
    use ModelObservantTrait;
    use GenerateStringIdObservantTrait;
    use CacheClearObservantTrait;
    use SoftDeletes;
    use HasTranslations;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'parametric_tables';
    protected $primaryKey = 'id';
    public $timestamps = true;
    protected $guarded = ['id'];
    protected $fillable = [
        'table_name',
        'table_description',
        'name',
        'resource',
    ];
    protected $translatable = ['name'];
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
            $this->table_name
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function parametricTableValues()
    {
        return $this->hasMany(ParametricTableValue::class, 'parametric_table_id', 'id')
            ->ordered();
    }

    public function parametricTableValuesResource()
    {
        return $this->hasMany(ParametricTableValue::class, 'parametric_table_id', 'id')
            ->resource()
            ->active()
            ->ordered();
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeResource($query)
    {
        return $query->where($this->table . '.resource', 1);
    }

    public function scopeTableId($query, $tableId)
    {
        return $query->when(!is_null($tableId), function ($query) use ($tableId) {
            return $query->where('id', $tableId);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    public function getCountValuesAttribute()
    {
        return count($this->parametricTableValues);
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */
}
