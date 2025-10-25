<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SceneItem extends Model
{
    use CrudTrait;
    use HasFactory;
    use HasTranslations;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'scene_items';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];
    protected $fillable = [
        'name',
        'file_name',
        'sprite_file',
        'catch_file_name',
        'catch_sprite_file',
        'text',
        'active',
    ];
    // protected $hidden = [];
    public $translatable = [
        'name',
        'text'
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

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where($this->table . '.active', 1);
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

    public function setSpriteFileAttribute($value)
    {
        $attribute = 'sprite_file';
        $disk = 'uploads'; // Debe existir en config/filesystems.php
        $folder = Str::slug($this->name ?? 'scene-item');
        $destinationPath = "uploads/scene-item/{$folder}"; // ¡Ojo! sin 'uploads/' delante

        // Borrar imagen (cuando el campo se limpia en Backpack)
        if ($value === null) {
            if (!empty($this->{$attribute})) {
                Storage::disk($disk)->delete($this->{$attribute});
            }
            $this->attributes[$attribute] = null;
            return;
        }

        // Subida normal (input type="file")
        if ($value instanceof UploadedFile) {
            $ext = $value->getClientOriginalExtension() ?: $value->extension() ?: 'jpg';
            $filename = Str::random(40) . '.' . $ext;
            $path = $value->storeAs($destinationPath, $filename, $disk);

            // elimina el anterior si cambia
            $old = $this->getOriginal($attribute);
            if (!empty($old) && $old !== $path) {
                Storage::disk($disk)->delete($old);
            }

            $this->attributes[$attribute] = $path;
            return;
        }

        // Base64 (por si usas un campo que envía data:image/...)
        if (is_string($value) && str_starts_with($value, 'data:image')) {
            [$meta, $data] = explode(',', $value, 2);
            $binary = base64_decode($data);
            $ext = str_contains($meta, 'image/webp') ? 'webp' : (str_contains($meta, 'image/png') ? 'png' : 'jpg');
            $filename = Str::random(40) . '.' . $ext;
            $path = "{$destinationPath}/{$filename}";

            Storage::disk($disk)->put($path, $binary);

            // elimina el anterior si cambia
            $old = $this->getOriginal($attribute);
            if (!empty($old) && $old !== $path) {
                Storage::disk($disk)->delete($old);
            }

            $this->attributes[$attribute] = $path;
            return;
        }

        // Si llega una cadena (ruta existente), la guardamos tal cual
        if (is_string($value)) {
            $this->attributes[$attribute] = $value;
        }
    }

    public function setCatchSpriteFileAttribute($value)
    {
        $attribute = 'catch_sprite_file';
        $disk = 'uploads'; // Debe existir en config/filesystems.php
        $folder = Str::slug($this->name ?? 'scene-item');
        $destinationPath = "uploads/scene-item/{$folder}"; // ¡Ojo! sin 'uploads/' delante

        // Borrar imagen (cuando el campo se limpia en Backpack)
        if ($value === null) {
            if (!empty($this->{$attribute})) {
                Storage::disk($disk)->delete($this->{$attribute});
            }
            $this->attributes[$attribute] = null;
            return;
        }

        // Subida normal (input type="file")
        if ($value instanceof UploadedFile) {
            $ext = $value->getClientOriginalExtension() ?: $value->extension() ?: 'jpg';
            $filename = Str::random(40) . '.' . $ext;
            $path = $value->storeAs($destinationPath, $filename, $disk);

            // elimina el anterior si cambia
            $old = $this->getOriginal($attribute);
            if (!empty($old) && $old !== $path) {
                Storage::disk($disk)->delete($old);
            }

            $this->attributes[$attribute] = $path;
            return;
        }

        // Base64 (por si usas un campo que envía data:image/...)
        if (is_string($value) && str_starts_with($value, 'data:image')) {
            [$meta, $data] = explode(',', $value, 2);
            $binary = base64_decode($data);
            $ext = str_contains($meta, 'image/webp') ? 'webp' : (str_contains($meta, 'image/png') ? 'png' : 'jpg');
            $filename = Str::random(40) . '.' . $ext;
            $path = "{$destinationPath}/{$filename}";

            Storage::disk($disk)->put($path, $binary);

            // elimina el anterior si cambia
            $old = $this->getOriginal($attribute);
            if (!empty($old) && $old !== $path) {
                Storage::disk($disk)->delete($old);
            }

            $this->attributes[$attribute] = $path;
            return;
        }

        // Si llega una cadena (ruta existente), la guardamos tal cual
        if (is_string($value)) {
            $this->attributes[$attribute] = $value;
        }
    }
}
