<?php

namespace App\Models;

use App\Observers\UserObserver;
use Illuminate\Support\Facades\DB;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Foundation\Auth\User as Authenticatable;

#[ObservedBy([UserObserver::class])]
class User extends Authenticatable
{
    use CrudTrait;
    use HasRoles;
    use HasFactory;
    use HasApiTokens;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'lang',
        'password',
        'username',
        'description',
        'ficha_color',
        'shadow_color',
        'chat_color',
        'name_color',
        'avatar',
        'gold_coins',
        'silver_coins',
        'rings_won',
        'coconuts_caught',
        'uppercuts_sent',
        'uppercuts_received',
        'coconuts_sent',
        'coconuts_received',
        'last_update_username_at',
        'phaser_rendering_type',
        'phaser_antialias',
        'phaser_antialias_gl',
        'phaser_pixel_art',
        'phaser_round_pixels',
        'phaser_power_preference',
        'is_bot',
        'bot_system_prompt',
        'bot_language_mode',
        'bot_settings',
        'active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_bot' => 'boolean',
            'bot_settings' => 'array',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | FUNCTIONS
    |--------------------------------------------------------------------------
    */

    public function enabledFichas(): array
    {
        return DB::table('user_catalog_items as uci')
            ->join('catalog_items as ci', 'ci.id', '=', 'uci.catalog_item_id')
            ->where('uci.user_id', $this->id)
            ->whereNull('uci.private_scene_id')
            ->whereNotNull('ci.user_decoration_type')
            ->where('ci.user_decoration_type', 'ficha')
            ->pluck('ci.user_decoration_value')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    public function enabledChats(): array
    {
        return DB::table('user_catalog_items as uci')
            ->join('catalog_items as ci', 'ci.id', '=', 'uci.catalog_item_id')
            ->where('uci.user_id', $this->id)
            ->whereNull('uci.private_scene_id')
            ->whereNotNull('ci.user_decoration_type')
            ->where('ci.user_decoration_type', 'chat')
            ->pluck('ci.user_decoration_value')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    public function enabledColorNames(): array
    {
        return DB::table('user_catalog_items as uci')
            ->join('catalog_items as ci', 'ci.id', '=', 'uci.catalog_item_id')
            ->where('uci.user_id', $this->id)
            ->whereNull('uci.private_scene_id')
            ->whereNotNull('ci.user_decoration_type')
            ->where('ci.user_decoration_type', 'name')
            ->pluck('ci.user_decoration_value')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    public function enabledShadows(): array
    {
        return DB::table('user_catalog_items as uci')
            ->join('catalog_items as ci', 'ci.id', '=', 'uci.catalog_item_id')
            ->where('uci.user_id', $this->id)
            ->whereNull('uci.private_scene_id')
            ->whereNotNull('ci.user_decoration_type')
            ->where('ci.user_decoration_type', 'shadow')
            ->pluck('ci.user_decoration_value')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    public function enabledAvatars(): array
    {
        return DB::table('user_catalog_items as uci')
            ->join('catalog_items as ci', 'ci.id', '=', 'uci.catalog_item_id')
            ->where('uci.user_id', $this->id)
            ->whereNull('uci.private_scene_id')
            ->whereNotNull('ci.user_decoration_type')
            ->where('ci.user_decoration_type', 'avatar')
            ->pluck('ci.user_decoration_value')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function islands()
    {
        return $this->hasMany(Island::class);
    }

    public function catalogItems()
    {
        return $this->hasMany(UserCatalogItem::class)->where('private_scene_id', null);
    }

    public function catalogShowItems()
    {
        return $this->hasMany(UserCatalogItem::class)->where('private_scene_id', null)
            ->where('show_in_inventory', true);
    }

    public function userCatalogItems()
    {
        return $this->hasMany(UserCatalogItem::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    /**
     * Scope a query to only include bots
     */
    public function scopeBots($query)
    {
        return $query->where('is_bot', true);
    }

    /**
     * Scope a query to only include active bots
     */
    public function scopeActiveBots($query)
    {
        return $query->where('is_bot', true)->where('active', true);
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    /**
     * Get daily quota for bot (from bot_settings)
     */
    public function getDailyQuota(): int
    {
        if (!$this->is_bot) {
            return 0;
        }
        return $this->bot_settings['daily_quota'] ?? 300;
    }

    /**
     * Get cooldown seconds for bot (from bot_settings)
     */
    public function getCooldownSeconds(): int
    {
        if (!$this->is_bot) {
            return 0;
        }
        return $this->bot_settings['cooldown_sec'] ?? 2;
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */
}
