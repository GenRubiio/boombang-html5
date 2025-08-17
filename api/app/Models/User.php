<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use App\Observers\UserObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;

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
        return $this->fichas()->get()->pluck('ficha_color')->toArray();
    }

    public function enabledChats(): array
    {
        return $this->chats()->get()->pluck('chat_color')->toArray();
    }

    public function enabledColorNames(): array
    {
        return $this->colornames()->get()->pluck('name_color')->toArray();
    }

    public function enabledShadows(): array
    {
        return $this->shadows()->get()->pluck('shadow_color')->toArray();
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

    public function fichas()
    {
        return $this->hasMany(UserFicha::class, 'user_id', 'id');
    }

    public function chats()
    {
        return $this->hasMany(UserChat::class, 'user_id', 'id');
    }

    public function colornames()
    {
        return $this->hasMany(UserColorname::class, 'user_id', 'id');
    }

    public function shadows()
    {
        return $this->hasMany(UserShadow::class, 'user_id', 'id');
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
