<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;

class Mail extends Model
{
    use CrudTrait;
    use HasFactory;
    use HasTranslations;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'mails';
    protected $guarded = ['id'];
    protected $fillable = [
        'title',
        'description',
        'is_active',
        'send_to_all',
        'is_persistent',
        'gold_coins',
        'silver_coins',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'send_to_all' => 'boolean',
        'is_persistent' => 'boolean',
        'gold_coins' => 'integer',
        'silver_coins' => 'integer',
    ];

    public $translatable = [
        'description'
    ];

    /*
    |--------------------------------------------------------------------------
    | FUNCTIONS
    |--------------------------------------------------------------------------
    */

    /**
     * Verifica si el correo tiene alguna recompensa (monedas o items)
     */
    public function hasRewards()
    {
        return $this->gold_coins > 0 || $this->silver_coins > 0 || $this->rewards()->count() > 0;
    }

    public function getTranslatable()
    {
        return $this->translatable;
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    /**
     * Relación con los destinatarios del correo
     */
    public function recipients()
    {
        return $this->hasMany(MailRecipient::class, 'mail_id');
    }

    /**
     * Relación con las recompensas (items del catálogo)
     */
    public function rewards()
    {
        return $this->hasMany(MailReward::class, 'mail_id');
    }

    /**
     * Relación many-to-many con usuarios a través de mail_recipients
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'mail_recipients', 'mail_id', 'user_id')
            ->withPivot('is_read', 'is_claimed', 'claimed_at')
            ->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    /**
     * Scope para obtener solo correos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para obtener correos dirigidos a todos
     */
    public function scopeSendToAll($query)
    {
        return $query->where('send_to_all', true);
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
