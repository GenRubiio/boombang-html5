<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;
    use CrudTrait;
    use HasRoles;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'surname',
        'email',
        'password',
        'active',
        'created_user',
        'updated_user',
        'deleted_user',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $appends = [
        //'full_name'
    ];

    protected $guard_name = 'web';

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

    public function scopeWhereHasRole($query, $role)
    {
        return $query->whereHas('roles', function ($q) use ($role) {
            $q->where('name', $role);
        });
    }

    public function scopeRole($query, $role)
    {
        if (!is_array($role)) {
            $role = [$role];
        }
        return $query->whereHas('roles', function ($q) use ($role) {
            $q->whereIn('name', $role);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESORS
    |--------------------------------------------------------------------------
    */

    public function getFullNameAttribute()
    {
        return $this->name . ' ' . $this->surname;
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    /*
     * Necesitamos tener instalado en servidor Imagick.
     * Llamar a la función cuando tengamos id de usuario, no como mutator ya que no existe aún la id.
    public function generateUserImage()
    {
        //$attributeName = "image";
        //$disk = "uploads";
        //$destinationPath = "uploads/articles/" . Str::slug($this->title);


        $outputFormat = 'png';
        $dirPath = '/uploads/users/';
        !is_dir(public_path() . $dirPath) ? mkdir(public_path() . $dirPath, 0755, true) : "";

        // Generamos binario aleatorio a partir de la ID del user, 15 números
        $userId = $this->id;
        srand($userId);
        $randArray = str_split(sprintf("%015b", rand(0, (pow(2, 15) - 1))));

        $image = new Imagick();
        $image->newImage(5, 5, new ImagickPixel('#ffffff'));

        $pixelIterator = $image->getPixelIterator();
        foreach ($pixelIterator as $y => $pixels) {
            $counter = $y * 3;
            foreach ($pixels as $x => $pixel) {
                if ($randArray[$counter] == 1) {
                    //echo 'Counter: '.$counter.PHP_EOL.' Position: '.$y.','.$x.' -> 1'.PHP_EOL;
                    $pixel->setColor("#0000ff");
                }
                if ($x < 2) {
                    $counter++;
                } else {
                    $counter--;
                }
            }
            $pixelIterator->syncIterator();
        }

        $image->resizeImage(250, 250, Imagick::STRETCH_NORMAL, 0);

        $image->setImageFormat($outputFormat);
        $imagePath = $dirPath . $userId . '.' . $outputFormat;
        $image->writeImage(public_path() . $imagePath);
        //saveImage($disk, $destinationPath . '/' . $filename, $image);

        return $imagePath;
    }
    */
}
