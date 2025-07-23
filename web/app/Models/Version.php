<?php

namespace App\Models;

use App\Traits\Observers\ModelObservantTrait;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Version extends Model
{
    use CrudTrait;
    use ModelObservantTrait;
    use SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'versions';
    protected $primaryKey = 'id';
    public $timestamps = true;
    // protected $guarded = ['id'];
    protected $fillable = [
        'tag',
        'major',
        'minor',
        'patch',
        'name',
        'description',
        'date',
        'commit',
        'deleted_user'
    ];
    //protected $translatable = [];
    // protected $fakeColumns = [];
    // protected $hidden = [];
    // protected $dates = [];

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

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeOrdered($query)
    {
        return $query->orderBy($this->table . '.date', 'desc')->orderBy($this->table . '.id', 'desc');
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

    /*
    public function setTagAttribute($value)
    {
        $this->attributes['tag'] = ;
    }
    */

    protected function tag(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => 'v' . $value,
        );
    }
}
