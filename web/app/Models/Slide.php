<?php

namespace App\Models;

use App\Enums\SlideTypeEnum;
use App\Traits\Observers\ModelObservantTrait;
use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Backpack\CRUD\app\Models\Traits\SpatieTranslatable\HasTranslations;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class Slide extends Model
{
    use CrudTrait;
    use HasFactory;
    use HasTranslations;
    use ModelObservantTrait;
    use SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'slides';
    protected $primaryKey = 'id';
    public $timestamps = true;
    // protected $guarded = ['id'];
    protected $fillable = [
        'slider',
        'title',
        'text',
        'alt',
        'link',
        'target_blank',
        'button_text',
        'date_start',
        'date_end',
        'image_desktop',
        'image_tablet',
        'image_mobile',
        'parent_id',
        'lft',
        'rgt',
        'depth',
        'active',
        'deleted_user'
    ];
    protected $translatable = [
        'title',
        'text',
        'alt',
        'link',
        'button_text'
    ];
    protected $casts = [
        'date_start' => 'datetime',
        'date_end' => 'datetime'
    ];
    // protected $fakeColumns = [];
    // protected $hidden = [];
    protected $dates = [
        'date_start',
        'date_end'
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

    public function scopeTypeHome($query)
    {
        return $query->where($this->table . '.slider', SlideTypeEnum::HOME->key());
    }

    public function scopeActive($query)
    {
        return $query->where($this->table . '.active', 1);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy($this->table . '.lft', 'asc')->orderBy($this->table . '.id', 'desc');
    }

    public function scopeBetweenDates($query)
    {
        $now = Carbon::now();
        return $query->where('date_start', '<=', $now)->where('date_end', '>=', $now)->orWhere('date_start', null);
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESSORS
    |--------------------------------------------------------------------------
    */

    public function getImageDesktopUrlAttribute(): ?string
    {
        return $this->image_desktop ? url($this->image_desktop) : null;
    }

    public function getImageTabletUrlAttribute(): ?string
    {
        return $this->image_tablet ? url($this->image_tablet) : $this->image_desktop_url;
    }

    public function getImageMobileUrlAttribute(): ?string
    {
        return $this->image_mobile ? url($this->image_mobile) : $this->image_tablet_url;
    }

    public function getAltImageWithBackupAttribute(): string
    {
        if (!empty($this->alt)) {
            return $this->alt;
        }
        return $this->title;
    }

    public function getTitleImageWithBackupAttribute(): string
    {
        if (!empty($this->alt)) {
            return $this->alt;
        }
        return $this->alt_image_with_backup;
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    public function setImageDesktopAttribute($value)
    {
        $oldValue = $this->image_desktop;
        $id = $this->id ?? request()->nextId;
        $locale = request()->get('locale') ?? LaravelLocalization::getCurrentLocale();
        $attribute_name = "image_desktop";
        $disk = "uploads";
        $destination_path = "uploads/slides";

        // if the image was erased
        if ($value == null) {
            // delete the image from disk
            removeFile($disk, $this->{$attribute_name});

            // set null in the database column
            $return = null;
        } // if a base64 was sent, store it in the db
        elseif (Str::startsWith($value, 'data:image')) {
            // 0. Make the image
            $image = Image::make($value);

            $extension = getExtensionByMimetype($image->mime());
            // 1. Generate a filename.
            $filename = Str::slug($id . '-' . $locale . config('images.desktop_add_name')) . $extension;
            // 2. Store the image on disk.
            //Optimize max size and save
            resizeImage($image, config('images.desktop_max_width'), null);
            saveImage($disk, $destination_path . '/' . $filename, $image);

            // 3. Save the path to the database
            $return = $destination_path . '/' . $filename;
        } else {
            $return = $oldValue;
        }

        $this->attributes[$attribute_name] = $return;
    }

    public function setImageTabletAttribute($value)
    {
        $oldValue = $this->image_tablet;
        $id = $this->id ?? request()->nextId;
        $locale = request()->get('locale') ?? LaravelLocalization::getCurrentLocale();
        $attribute_name = "image_tablet";
        $disk = "uploads";
        $destination_path = "uploads/slides";

        // if the image was erased
        if ($value == null) {
            // delete the image from disk
            removeFile($disk, $this->{$attribute_name});

            // set null in the database column
            $return = null;
        } // if a base64 was sent, store it in the db
        elseif (Str::startsWith($value, 'data:image')) {
            // 0. Make the image
            $image = Image::make($value);
            $extension = getExtensionByMimetype($image->mime());
            // 1. Generate a filename.
            $filename = Str::slug($id . '-' . $locale . config('images.tablet_add_name')) . $extension;
            // 2. Store the image on disk.
            //Optimize max size and save
            resizeImage($image, config('images.tablet_max_width'), null);
            saveImage($disk, $destination_path . '/' . $filename, $image);

            // 3. Save the path to the database
            $return = $destination_path . '/' . $filename;
        } else {
            $return = $oldValue;
        }

        $this->attributes[$attribute_name] = $return;
    }

    public function setImageMobileAttribute($value)
    {
        $oldValue = $this->image_mobile;
        $id = $this->id ?? request()->nextId;
        $locale = request()->get('locale') ?? LaravelLocalization::getCurrentLocale();
        $attribute_name = "image_mobile";
        $disk = "uploads";
        $destination_path = "uploads/slides";

        // if the image was erased
        if ($value == null) {
            // delete the image from disk
            removeFile($disk, $this->{$attribute_name});

            // set null in the database column
            $return = null;
        } // if a base64 was sent, store it in the db
        elseif (Str::startsWith($value, 'data:image')) {
            // 0. Make the image
            $image = Image::make($value);
            $extension = getExtensionByMimetype($image->mime());
            // 1. Generate a filename.
            $filename = Str::slug($id . '-' . $locale . config('images.mobile_add_name')) . $extension;
            // 2. Store the image on disk.
            //Optimize max size and save
            resizeImage($image, config('images.mobile_max_width'), null);
            saveImage($disk, $destination_path . '/' . $filename, $image);

            // 3. Save the path to the database
            $return = $destination_path . '/' . $filename;
        } else {
            $return = $oldValue;
        }

        $this->attributes[$attribute_name] = $return;
    }
}
