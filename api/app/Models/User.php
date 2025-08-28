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
        'is_bot',
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
