<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;

class CatalogItem extends Model
{
    use CrudTrait;
    use HasFactory;
    use HasTranslations;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'catalog_items';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];

    protected $fillable = [
        'category_id',
        'user_id',
        'name',
        'sprite_name',
        'image',
        'spreadsheet',
        'atlas',
        'width',
        'height',
        'description',
        'price',
        'type',
        'price_type',
        'discount',
        'stars',
        'map_size',
        'user_decoration_type',
        'user_decoration_value',
        'in_lobby_gacha',
        'show_in_inventory',
        'is_purchasable',
        'is_active',
        'parent_id',
        'lft',
        'rgt',
        'depth'
    ];

    public $translatable = [
        'name',
        'description'
    ];
    // protected $hidden = [];

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

    public function category()
    {
        return $this->belongsTo(CatalogCategory::class, 'category_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeInLobbyGacha($query)
    {
        return $query->where('in_lobby_gacha', true)
            ->where('is_active', true);
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

    public function setSpreadsheetAttribute($value)
    {
        $folder = Str::slug($this->name);
        $attribute_name = "spreadsheet"; // nombre del campo en BD
        $disk = "uploads"; // el disco en config/filesystems.php
        $destination_path = "uploads/catalog/{$folder}";

        if ($value == null) {
            Storage::disk($disk)->delete($this->{$attribute_name});
            $this->attributes[$attribute_name] = null;
            return;
        }

        // Si llega un archivo en base64 o UploadedFile
        if (is_file($value) && $value->isValid()) {
            // generar nombre único
            $filename = Str::random(40) . '.' . $value->getClientOriginalExtension();

            // subir archivo
            $path = $value->storeAs($destination_path, $filename, $disk);

            // guardar en BD solo la ruta
            $this->attributes[$attribute_name] = $path;
        }
    }

    public function setAtlasAttribute($value)
    {
        $folder = Str::slug($this->name);
        $attribute_name = "atlas"; // nombre del campo en BD
        $disk = "uploads"; // el disco en config/filesystems.php
        $destination_path = "uploads/catalog/{$folder}";

        if ($value == null) {
            Storage::disk($disk)->delete($this->{$attribute_name});
            $this->attributes[$attribute_name] = null;
            return;
        }

        // Si llega un archivo en base64 o UploadedFile
        if (is_file($value) && $value->isValid()) {
            // generar nombre único
            $filename = Str::random(40) . '.' . $value->getClientOriginalExtension();

            // subir archivo
            $path = $value->storeAs($destination_path, $filename, $disk);

            // guardar en BD solo la ruta
            $this->attributes[$attribute_name] = $path;
        }
    }
}
