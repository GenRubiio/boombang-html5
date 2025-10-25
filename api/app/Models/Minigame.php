<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;


class Minigame extends Model
{
    use CrudTrait;
    use HasFactory;
    use HasTranslations;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'minigames';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];
    protected $fillable = [
        'name',
        'type',
        'description',
    ];
    // protected $hidden = [];
    public $translatable = [
        'name'
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

    public function weeks()
    {
        return $this->hasMany(MinigameWeek::class, 'minigame_id');
    }

    public function rewards()
    {
        return $this->hasMany(Reward::class, 'minigame_id');
    }

    /**
     * When a new Minigame is created, ensure there is an initial MinigameWeek
     * covering the current ISO week (Monday 00:00 -> next Monday 00:00).
     */
    protected static function booted()
    {
        static::created(function (Minigame $minigame) {
            try {
                $now = Carbon::now();

                // calculate start = Monday 00:00 of current ISO week
                $start = $now->copy()->startOfWeek();
                // ensure startOfWeek uses Monday; if not, force by modify
                if ($start->dayOfWeek !== Carbon::MONDAY) {
                    $start = $now->copy()->modify('monday this week')->startOfDay();
                }

                // end = next Monday 00:00 (Sunday 24:00)
                $end = $start->copy()->addDays(7)->startOfDay();

                $weekNumber = $start->isoWeek();
                $year = $start->year;

                // avoid duplicates
                $exists = MinigameWeek::where('minigame_id', $minigame->id)
                    ->where('week_number', $weekNumber)
                    ->where('year', $year)
                    ->exists();

                if (! $exists) {
                    MinigameWeek::create([
                        'minigame_id' => $minigame->id,
                        'week_number' => $weekNumber,
                        'year' => $year,
                        'start_date' => $start,
                        'end_date' => $end,
                    ]);
                }
            } catch (\Throwable $e) {
                // swallow exceptions to avoid breaking creation flow; log if logger available
                if (function_exists('logger')) {
                    logger()->error('Failed to create initial MinigameWeek for minigame ' . $minigame->id . ': ' . $e->getMessage());
                }
            }
        });
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
