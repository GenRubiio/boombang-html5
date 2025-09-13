<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SceneArrow extends Model
{
    use CrudTrait;
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'scene_arrows';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];
    protected $fillable = [
        'name',
        'sprite_name',
        'image',
    ];
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

    public function setImageAttribute($value)
    {
        $attribute = 'image';
        $disk = 'uploads'; // Debe existir en config/filesystems.php
        $folder = Str::slug($this->name ?? 'catalog');
        $destinationPath = "uploads/catalog/{$folder}"; // ¡Ojo! sin 'uploads/' delante

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

        if (Str::startsWith($value, 'data:image/svg+xml')) {
            $filename = Str::random(40) . '.svg';
            $value = str_replace('data:image/svg+xml;base64,', '', $value);
            $value = str_replace(' ', '+', $value);
            if (!File::exists($destinationPath)) {
                mkdir($destinationPath);
            }
            File::put($destinationPath . '/' . $filename, base64_decode($value));
            $this->attributes[$attribute] = $destinationPath . '/' . $filename;
            return;
        } else if (is_string($value) && str_starts_with($value, 'data:image')) {
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
