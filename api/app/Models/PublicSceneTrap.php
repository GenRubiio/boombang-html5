<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicSceneTrap extends Model
{
    use CrudTrait;
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'public_scene_traps';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];
    protected $fillable = [
        'public_scene_id',
        'position_x',
        'position_y',
        'coconut_type',
        'active',
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

    public function publicScene()
    {
        return $this->belongsTo(PublicScene::class, 'public_scene_id');
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

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    public function getCoconutTypeNameAttribute()
    {
        $coconutTypes = [
            0 => 'Coco',
            1 => 'Bola de nieve',
            2 => 'Zapato',
            3 => 'Pastel',
            4 => 'Maceta',
            5 => 'Avispas',
            6 => 'Basura',
            7 => 'Sandía',
            8 => 'Yunque',
            9 => 'Piano',
        ];

        return $coconutTypes[$this->coconut_type] ?? 'Desconocido';
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */
}
