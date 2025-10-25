<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Event extends Model
{
    use CrudTrait;
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'events';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];
    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
    ];
    /**
     * Ensure dates are cast to Carbon instances and append status attribute to arrays/json
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    protected $appends = ['status'];
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

    public function scores()
    {
        return $this->hasMany(EventScore::class, 'event_id');
    }

    public function rewards()
    {
        return $this->hasMany(Reward::class, 'event_id');
    }

    /**
     * Return an HTML badge representing the Event status: Pendiente, Activo, Terminado
     * Used by Backpack column via type 'model_function'.
     *
     * @return string
     */
    public function getStatusBadgeColumn()
    {
        $now = Carbon::now();

        $start = $this->start_date;
        $end = $this->end_date;

        if ($start && $now->lt($start)) {
            return '<span class="bb-status bb-status--pending">Pendiente</span>';
        }

        if ($start && $end && $now->between($start, $end)) {
            return '<span class="bb-status bb-status--active">Activo</span>';
        }

        if ($end && $now->gt($end)) {
            return '<span class="bb-status bb-status--ended">Terminado</span>';
        }

        // fallback
        return '<span class="bb-status bb-status--pending">Pendiente</span>';
    }

    /**
     * Status accessor returning a simple string status value.
     * Values: Pendiente, Activo, Terminado
     *
     * @return string
     */
    public function getStatusAttribute()
    {
        $now = Carbon::now();
        $start = $this->start_date;
        $end = $this->end_date;

        if ($start && $now->lt($start)) {
            return 'Pendiente';
        }

        if ($start && $end && $now->between($start, $end)) {
            return 'Activo';
        }

        if ($end && $now->gt($end)) {
            return 'Terminado';
        }

        return 'Pendiente';
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
