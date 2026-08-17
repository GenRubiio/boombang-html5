<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAvatarPalette extends Model
{
    protected $fillable = [
        'user_id',
        'avatar_id',
        'palette',
        'manifest_version',
    ];

    /**
     * `palette` is a `longText` column storing JSON — same pattern as
     * PublicScene::setAssetsDataAttribute() (PublicScene.php:163-175) — never a native `json`
     * column (project convention).
     */
    public function setPaletteAttribute($value)
    {
        $this->attributes['palette'] = $value === null ? null : json_encode($value);
    }

    public function getPaletteAttribute($value)
    {
        return $value === null ? [] : json_decode($value, true);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
