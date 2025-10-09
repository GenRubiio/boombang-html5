<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BotMessage extends Model
{
    use HasFactory;

    protected $table = 'bot_messages';

    protected $fillable = [
        'sender_type',
        'sender_id',
        'content',
        'language',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get sender (User - either bot or normal user)
     * Both bots and users are in the 'users' table
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Scope for bot sender
     */
    public function scopeFromBot($query)
    {
        return $query->where('sender_type', 'bot');
    }

    /**
     * Scope for user sender
     */
    public function scopeFromUser($query)
    {
        return $query->where('sender_type', 'user');
    }

    /**
     * Scope for recent messages
     */
    public function scopeRecent($query, int $limit = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    /**
     * Scope for conversation between bot and user
     */
    public function scopeConversation($query, int $botId, int $userId)
    {
        return $query->where(function($q) use ($botId, $userId) {
            $q->where(function($q1) use ($botId) {
                $q1->where('sender_type', 'bot')
                   ->where('sender_id', $botId);
            })->orWhere(function($q2) use ($userId) {
                $q2->where('sender_type', 'user')
                   ->where('sender_id', $userId);
            });
        });
    }
}
