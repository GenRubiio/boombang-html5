<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogItem extends Model
{
    use CrudTrait;
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'catalog_items';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];

    protected $fillable = [
        'category_id',
        'name',
        'sprite_name',
        'image',
        'description',
        'price',
        'price_type',
        'discount',
        'map_size',
        'is_purchasable',
        'is_active',
        'parent_id',
        'lft',
        'rgt',
        'depth'
    ];
    // protected $hidden = [];

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

    public function category()
    {
        return $this->belongsTo(CatalogCategory::class, 'category_id');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

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
