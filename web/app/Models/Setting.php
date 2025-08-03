<?php

namespace App\Models;

use App\Traits\Observers\ModelObservantTrait;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class Setting extends Model
{
    use CrudTrait;
    use SoftDeletes;
    use ModelObservantTrait;

    protected $table = 'settings';
    protected $fillable = [
        'key',
        'type',
        'name',
        'description',
        'value',
        'field',
        'active',
        'deleted_user'
    ];

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
    | ACCESORS
    |--------------------------------------------------------------------------
    */
    /**
     * Grab a setting value from the database.
     *
     * @param string $key The setting key, as defined in the key db column
     *
     * @return string The setting value.
     */
    public static function get($key)
    {
        $setting = new self();
        $entry = $setting->active()->where('key', $key)->first();

        if (!$entry) {
            return;
        }

        return $entry->value;
    }

    /**
     * Update a setting's value.
     *
     * @param string $key The setting key, as defined in the key db column
     * @param string $value The new value.
     */
    public static function set($key, $value = null)
    {
        $prefixed_key = 'settings.' . $key;
        $setting = new self();
        $entry = $setting->where('key', $key)->firstOrFail();

        // update the value in the database
        $entry->value = $value;
        $entry->saveOrFail();

        // update the value in the session
        Config::set($prefixed_key, $value);

        if (Config::get($prefixed_key) == $value) {
            return true;
        }

        return false;
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    public function setKeyAttribute($value)
    {
        $this->attributes['key'] = Str::slug($value, '_');
    }

    public function setFieldAttribute($value)
    {
        $this->attributes['field'] = json_encode(settingTypeSelect($value));
    }

    public function setValueAttribute($value)
    {
        switch ($this->attributes['type']) {
            /*
            case "radio":
                $this->attributes['value'] = $value;
            case "text":
                $this->attributes['value'] = $value;
            */
            case "image":
                $attributeName = "value";
                $disk = "uploads";
                $destinationPath = "uploads/settings";

                // if the image was erased
                if ($value == null) {
                    // delete the image from disk
                    if (!empty($this->{$attributeName})) {
                        removeFile($this->{$attributeName}, $disk);
                    }

                    // set null in the database column
                    $this->attributes[$attributeName] = null;
                }

                $filename = Str::slug($this->attributes['key'], '_');
                // if a base64 was sent, store it in the db
                if (Str::startsWith($value, 'data:image/svg+xml')) {
                    $filename = $filename . '.svg';
                    $value = str_replace('data:image/svg+xml;base64,', '', $value);
                    $value = str_replace(' ', '+', $value);
                    if (!empty($this->{$attributeName})) {
                        removeFile($this->{$attributeName}, $disk);
                    }
                    if (!File::exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    File::put($destinationPath . '/' . $filename, base64_decode($value));
                    $this->attributes[$attributeName] = $destinationPath . '/' . $filename;
                } elseif (Str::startsWith($value, 'data:image/webp')) {
                    $filename = $filename . '.webp';
                    $path = $destinationPath . '/' . $filename;
                    $value = str_replace('data:image/webp;base64,', '', $value);
                    $value = str_replace(' ', '+', $value);
                    if (!File::exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    File::put($path, base64_decode($value));
                    $this->attributes[$attributeName] = $path;
                } elseif (Str::startsWith($value, 'data:image')) {
                    // 0. Make the image
                    $image = Image::make($value);
                    $extension = getExtensionByMimetype($image->mime());
                    // 1. Generate a filename.
                    $filename = $filename . $extension;
                    // 2. Store the image on disk.
                    //Optimize max size and save
                    resizeImage($image, null, null);
                    if (!empty($this->{$attributeName})) {
                        removeFile($this->{$attributeName}, $disk);
                    }
                    saveImage($disk, $destinationPath . '/' . $filename, $image);

                    // 3. Save the path to the database
                    $this->attributes[$attributeName] = $destinationPath . '/' . $filename;

                    // 4. Generate mobile & thumbnail image
                    //generateMobileImage($disk, $image, $filename, $destinationPath);
                    //generateThumbnailImage($disk, $image, $filename, $destinationPath);
                }
                break;
            default:
                $this->attributes['value'] = $value;
        }
    }
}
