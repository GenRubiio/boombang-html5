<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogItemRequirement extends Model
{
    use CrudTrait;
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'catalog_item_requirements';
    protected $guarded = ['id'];
    protected $fillable = [
        'catalog_item_id',
        'required_catalog_item_id',
        'required_quantity',
        'required_gold_coins',
        'required_silver_coins',
    ];

    protected $casts = [
        'required_quantity' => 'integer',
        'required_gold_coins' => 'integer',
        'required_silver_coins' => 'integer',
    ];

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

    public function catalogItem()
    {
        return $this->belongsTo(CatalogItem::class, 'catalog_item_id');
    }

    public function requiredCatalogItem()
    {
        return $this->belongsTo(CatalogItem::class, 'required_catalog_item_id');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeWithItems($query)
    {
        return $query->whereNotNull('required_catalog_item_id');
    }

    public function scopeWithCoins($query)
    {
        return $query->where(function ($q) {
            $q->where('required_gold_coins', '>', 0)
                ->orWhere('required_silver_coins', '>', 0);
        });
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
