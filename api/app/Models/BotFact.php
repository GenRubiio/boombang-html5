<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BotFact extends Model
{
    use HasFactory;

    protected $table = 'bot_facts';

    protected $fillable = [
        'bot_id',
        'user_id',
        'fact',
        'confidence',
        'source',
        'metadata',
    ];

    protected $casts = [
        'confidence' => 'float',
        'metadata' => 'array',
    ];

    /**
     * Get the bot user (is_bot=1)
     */
    public function bot()
    {
        return $this->belongsTo(User::class, 'bot_id');
    }

    /**
     * Get the related user
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
