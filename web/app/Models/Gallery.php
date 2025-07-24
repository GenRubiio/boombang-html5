<?php

namespace App\Models;

use App\Traits\Observers\ModelObservantTrait;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class Gallery extends Model
{
    use CrudTrait;
    use HasTranslations;
    use ModelObservantTrait;
    use SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'galleries';
    protected $primaryKey = 'id';
    public $timestamps = true;
    // protected $guarded = ['id'];
    protected $fillable = [
        'galleryable_id',
        'galleryable_type',
        'type',
        'name',
        'alt',
        'title',
        'image',
        'video',
        'file',
        'parent_id',
        'lft',
        'rgt',
        'depth',
        'active',
        'deleted_user'
    ];
    protected $translatable = ['alt', 'title'];

    // protected $hidden = [];
    // protected $dates = [];
    protected $fakeColumns = [];
    protected $casts = [
        'video' => 'object'
        //'extras_no_translatable' => 'array',
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
    public function galleryable()
    {
        return $this->morphTo();
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */
    public function scopeType($query, $type)
    {
        return $query->whereType($type);
    }

    public function scopeImage($query)
    {
        return $query->whereNotNull('image');
    }

    public function scopeVideo($query)
    {
        return $query->whereNotNull('video');
    }

    public function scopeFile($query)
    {
        return $query->whereNotNull('file');
    }

    public function scopeActive($query)
    {
        return $query->where($this->table . '.active', 1);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy($this->table . '.lft', 'asc')->orderBy($this->table . '.id', 'desc');
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */
    public function getMobileAttribute()
    {
        $extension = pathinfo($this->image)['extension'];
        return str_replace('.' . $extension, config('images.mobile_add_name') . '.' . $extension, $this->image);
    }

    public function getThumbnailAttribute()
    {
        $extension = pathinfo($this->image)['extension'];
        return str_replace('.' . $extension, config('images.thumbnail_add_name') . '.' . $extension, $this->image);
    }

    public function getEmbedAttribute()
    {
        return str_replace('watch?v=', 'embed/', $this->video->url);
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    public function setImageAttribute($value)
    {
        $attributeName = "image";
        $disk = "uploads";
        $destinationPath = "uploads/images";
        if (!is_null(Request::input('destinationPath') && Request::input('filename') != "")) {
            $destinationPath .= '/' . Request::input('destinationPath');
        }

        // if the image was erased
        if ($value == null) {
            // delete the image from disk
            if (Storage::disk($disk)->exists($this->{$attributeName})) {
                removeFile($this->{$attributeName}, $disk);
            }

            // set null in the database column
            $this->attributes[$attributeName] = null;
        }

        // if a base64 was sent, store it in the db
        if (Str::startsWith($value, 'data:image')) {
            // 0. Make the image
            $image = Image::make($value);
            $extension = getExtensionByMimetype($image->mime());
            // 1. Generate a filename.
            $filename = Str::slug(Request::input('filename')) . $extension;
            // 2. Store the image on disk.
            //Optimize max size and save
            resizeImage($image, null, null);
            saveImage($disk, $destinationPath . '/' . $filename, $image);

            // 3. Save the path to the database
            $this->attributes[$attributeName] = $destinationPath . '/' . $filename;

            // 4. Generate mobile & thumbnail image
            generateMobileImage($disk, $image, $filename, $destinationPath);
            generateThumbnailImage($disk, $image, $filename, $destinationPath);
        }
    }

    public function setVideoAttribute($value)
    {
        $attributeName = "video";
        $disk = "uploads";
        $destinationPath = "uploads/videos";

        if ($value) {
            if (is_object($value) && method_exists($value, 'getType') && $value->getType() == 'file') {
                $this->customUploadFileToDisk($value, $attributeName, $disk, $destinationPath);
            } else {
                $this->attributes[$attributeName] = $value;
            }
        } else {
            if (Storage::disk($disk)->exists($this->{$attributeName})) {
                removeFile($this->{$attributeName}, $disk);
            };
            $this->attributes[$attributeName] = null;
        }
    }

    public function setFileAttribute($value)
    {
        $attributeName = "file";
        $disk = "uploads";
        $destinationPath = "uploads/files";
        if (!is_null(Request::input('destinationPath') && Request::input('filename') != "")) {
            $destinationPath .= '/' . Request::input('destinationPath');
        }

        $this->customUploadFileToDisk($value, $attributeName, $disk, $destinationPath);
    }

    public function customUploadFileToDisk($value, $attributeName, $disk, $destinationPath)
    {
        $request = Request::instance();

        // if a new file is uploaded, delete the file from the disk
        if (!is_null($value) && $value->getType() == 'file' && $this->{$attributeName} && $this->{$attributeName} != null) {
            removeFile($this->{$attributeName}, $disk);
            $this->attributes[$attributeName] = null;
        }

        // if the file input is empty, delete the file from the disk
        if (is_null($value) && $this->{$attributeName} != null) {
            removeFile($this->{$attributeName}, $disk);
            $this->attributes[$attributeName] = null;
        }

        // if a new file is uploaded, store it on disk and its filename in the database
        if (!is_null($value) && $value->getType() == 'file') {

            // 1. Generate a new file name
            $file = $value;
            $extension = $file->getClientOriginalExtension();
            $filename = Str::slug(Request::input('filename')) . '.' . $extension;
            // 2. Move the new file to the correct path
            //saveFile($destinationPath . '/' . $filename, $file, $disk);
            saveFile($file, $destinationPath, $filename, $disk);
            //$file, $path, $filename, $disk
            //$file_path = $file->storeAs($destinationPath, $filename, $disk);

            // 3. Save the complete path to the database
            $this->attributes[$attributeName] = $destinationPath . '/' . $filename;
            //$this->attributes[$attributeName] = ($attributeName == 'video') ? json_encode($file_path) : $file_path;
        }
    }
}
