<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\File;

class PrivateSceneConfig extends Model
{
    use CrudTrait;
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'private_scene_configs';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];
    protected $fillable = [
        'island_type',
        'big_scene',
        'max_users',
        'map_width',
        'map_height',
        'map',
        'start_x',
        'start_y',
        'start_z',
        'default_colors',
        'name',
        'image',
        'assets_data',
        'active'
    ];
    // protected $hidden = [];
    protected $fakeColumns = [
        'assets_data',
    ];

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

    public function islandsConfig()
    {
        return $this->belongsTo(IslandsConfig::class, 'island_type', 'id');
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

    public function setImageAttribute($value)
    {
        $attribute = 'image';
        $disk = 'uploads'; // Debe existir en config/filesystems.php
        $folder = Str::slug($this->name ?? 'island-scene');
        $destinationPath = "uploads/island-scene/{$folder}"; // ¡Ojo! sin 'uploads/' delante

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

    public function setAssetsDataAttribute($value)
    {
        if (!empty($value)) {
            if (is_string($value)) {
                $value = json_decode($value, true);
            }
            $destinationPath = "uploads/island-scene/" . Str::slug($this->name) .  "/assets";
            $this->processDataRecursively($value, $destinationPath);
            $this->attributes['assets_data'] = json_encode($value);
        } else {
            $this->attributes['assets_data'] = null;
        }
    }

    private function processDataRecursively(&$value, $destinationPath = null)
    {
        foreach ($value as $key => &$subValue) {
            if (str_contains($key, 'image') && !is_array($subValue)) {
                $subValue = $this->saveImgInFakeField($subValue, $destinationPath);
            } elseif (str_contains($key, 'file') && !is_array($subValue)) {
                $subValue = $this->saveFileInFakeField($subValue, $destinationPath);
            } elseif (is_array($subValue)) {
                $this->processDataRecursively($subValue, $destinationPath);
            }
        }
    }

    public function saveFileInFakeField($value, $destinationPath)
    {
        try {
            $name = Str::random(10);
            if ($value == null) {
                return null;
            }
            $name = $name . '.' . $value->getClientOriginalExtension();
            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0777, true, true);
            }
            $value->move($destinationPath, $name);
            return $destinationPath . '/' . $name;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function saveImgInFakeField($value, $destinationPath)
    {
        try {
            $name = Str::random(10);
            $disk = "uploads";
            if ($value == null) {
                return null;
            }
            $filename = Str::slug($name);
            if (Str::startsWith($value, 'data:image/svg+xml')) {
                $filename = $filename . '.svg';
                $value = str_replace('data:image/svg+xml;base64,', '', $value);
                $value = str_replace(' ', '+', $value);
                if (!File::exists($destinationPath)) {
                    File::makeDirectory($destinationPath, 0777, true, true);
                }
                File::put($destinationPath . '/' . $filename, base64_decode($value));
                return $destinationPath . '/' . $filename;
            } elseif (Str::startsWith($value, 'data:image')) {
                [$meta, $data] = explode(',', $value, 2);
                $binary = base64_decode($data);
                $ext = str_contains($meta, 'image/webp') ? 'webp' : (str_contains($meta, 'image/png') ? 'png' : 'jpg');
                $filename = Str::random(40) . '.' . $ext;
                $path = "{$destinationPath}/{$filename}";

                Storage::disk($disk)->put($path, $binary);
                return $path;
            }
            return $value;
        } catch (\Exception $e) {
            return null;
        }
    }
}
