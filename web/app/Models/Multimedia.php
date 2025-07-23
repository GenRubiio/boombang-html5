<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Observers\ModelObservantTrait;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class Multimedia extends Model
{
    use CrudTrait;
    use ModelObservantTrait;
    use SoftDeletes;

    public const MULTIMEDIA_PATH = 'multimedia';

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'multimedia';
    protected $primaryKey = 'id';
    public $timestamps = true;
    //protected $guarded = ['id'];
    protected $fillable = [
        'id',
        'name',
        'file',
        'active',
    ];
    // protected $hidden = [];
    // protected $dates = [];

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

    public function scopeActive($query)
    {
        return $query->where($this->table . '.active', 1);
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    public function getUrlFileAttribute()
    {
        return URL::to('/') . '/' . $this->file;
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    public function setFileAttribute($value)
    {
        $attributeName = "file";
        $disk = "uploads";
        $destinationPath = Multimedia::MULTIMEDIA_PATH;

        $this->customUploadFileToDisk($value, $attributeName, $disk, $destinationPath);
    }

    public function customUploadFileToDisk($value, $attributeName, $disk, $destinationPath)
    {
        // if a new file is uploaded, delete the file from the disk
        if (!is_null($value) && $value->getType() == 'file' && $this->{$attributeName} && $this->{$attributeName} != null) {
            removeFile($disk, $this->{$attributeName});
            $this->attributes[$attributeName] = null;
        }

        // if the file input is empty, delete the file from the disk
        if (is_null($value) && $this->{$attributeName} != null) {
            removeFile($disk, $this->{$attributeName});
            $this->attributes[$attributeName] = null;
        }

        // if a new file is uploaded, store it on disk and its filename in the database
        if (!is_null($value) && $value->getType() == 'file') {
            // 1. Generate a new file name
            $file = $value;
            $extension = $file->getClientOriginalExtension();
            $filename = Str::slug(Request::input('name')) . '.' . $extension;
            // 2. Move the new file to the correct path
            saveFile($file, $destinationPath, $filename, $disk);
            // 3. Save the complete path to the database
            $this->attributes[$attributeName] = $destinationPath . '/' . $filename;
        }
    }
}
