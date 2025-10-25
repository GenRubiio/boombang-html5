<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;

class Npc extends Model
{
    use CrudTrait;
    use HasFactory;
    use HasTranslations;


    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'npcs';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];
    protected $fillable = [
        'type',
        'stripe_name',
        'name',
        'description',
        'image',
        'position_x',
        'position_y',
        'depth',
        'scale',
        'active',
    ];
    // protected $hidden = [];
    public $translatable = [
        'name',
        'description'
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
        $folder = Str::slug($this->name ?? 'npc');
        $destinationPath = "uploads/npc/{$folder}";

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
