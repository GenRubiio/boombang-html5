<?php

namespace App\Models;

use Backpack\CRUD\app\Models\Traits\CrudTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class PublicScene extends Model
{
    use CrudTrait;
    use HasFactory;

    /*
    |--------------------------------------------------------------------------
    | GLOBAL VARIABLES
    |--------------------------------------------------------------------------
    */

    protected $table = 'public_scenes';
    // protected $primaryKey = 'id';
    // public $timestamps = false;
    protected $guarded = ['id'];
    protected $fillable = [
        'npc_id',
        'name',
        'type',
        'darkening',
        'sound',
        'menu_type',
        'max_users',
        'map_width',
        'map_height',
        'map',
        'assets_data',
        'arrows',
        'start_x',
        'start_y',
        'start_z',
        'parent_id',
        'lft',
        'rgt',
        'depth',
        'active',
    ];
    protected $fakeColumns = [
        'assets_data',
        'scene_items_pivot',
        'arrows'
    ];

    /*
    |--------------------------------------------------------------------------
    | FUNCTIONS
    |--------------------------------------------------------------------------
    */

    public function arrows()
    {
        $output = [];
        $data = json_decode($this->arrows, true) ?? [];
        $arrowDataItems = $data['arrows_data'] ?? [];
        foreach ($arrowDataItems as $item) {
            if (isset($item) && !empty($item['scene_arrow_id'])) {
                $arrow = SceneArrow::find($item['scene_arrow_id']);
                if ($arrow) {
                    $output[] = [
                        'public_scene_id' => $item['public_scene_id'] ?? $this->id,
                        'image' => $arrow->image,
                        'image_url' => urlDocker($arrow->image),
                        'sprite_name' => $arrow->sprite_name,
                        'position_x' => $item['position_x'] ?? 0,
                        'position_y' => $item['position_y'] ?? 0,
                        'position_door_x' => $item['position_door_x'] ?? 0,
                        'position_door_y' => $item['position_door_y'] ?? 0,
                        'position_door_z' => $item['position_door_z'] ?? 0,
                        'scale' => $arrow->scale,
                    ];
                }
            }
        }
        return $output;
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function npc()
    {
        return $this->belongsTo(Npc::class, 'npc_id');
    }

    public function items()
    {
        return $this->belongsToMany(SceneItem::class, 'public_scene_items', 'public_scenes_id', 'scene_item_id')
            ->withPivot(
                'activate_time',
                'desactivate_time',
                'min_users',
                'sum_points',
                'sum_points_to_user_attribute',
                'user_attribute_name'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    public function setSoundAttribute($value)
    {
        $attribute_name = "sound";
        $disk = "uploads";
        $destination_path = "uploads/public-scene/" . Str::slug($this->name) .  "/sound";

        $this->uploadFileToDisk($value, $attribute_name, $disk, $destination_path);
    }

    public function setAssetsDataAttribute($value)
    {
        if (!empty($value)) {
            if (is_string($value)) {
                $value = json_decode($value, true);
            }
            $destinationPath = "uploads/public-scene/" . Str::slug($this->name) .  "/assets";
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

    public function setSceneItemsPivotAttribute($value)
    {
        if (!empty($value)) {
            if (is_string($value)) {
                $value = json_decode($value, true);
            }
            $this->attributes['scene_items_pivot'] = json_encode($value);
        } else {
            $this->attributes['scene_items_pivot'] = null;
        }
    }

    public function getSceneItemsPivotAttribute($value)
    {
        // Si hay un valor guardado en el campo fake, lo usamos
        if (!empty($value)) {
            return json_decode($value, true);
        }

        // Si no hay valor en el campo fake, cargamos desde la relación
        if ($this->exists) {
            $items = $this->items()->get();
            $pivotData = [];

            foreach ($items as $item) {
                $pivotData[] = [
                    'scene_item_id' => $item->id,
                    'activate_time' => $item->pivot->activate_time,
                    'desactivate_time' => $item->pivot->desactivate_time,
                    'min_users' => $item->pivot->min_users,
                    'sum_points' => $item->pivot->sum_points,
                    'sum_points_to_user_attribute' => $item->pivot->sum_points_to_user_attribute,
                    'user_attribute_name' => $item->pivot->user_attribute_name,
                ];
            }

            return $pivotData;
        }

        return [];
    }

    /*
    |--------------------------------------------------------------------------
    | CUSTOM BUTTONS
    |--------------------------------------------------------------------------
    */

    public function duplicateButton($crud = false)
    {
        return '<a class="btn btn-sm btn-link" 
                   href="' . url($crud->route . '/' . $this->getKey() . '/duplicate') . '" 
                   data-toggle="tooltip" 
                   title="Duplicar registro"
                   onclick="return confirm(\'¿Estás seguro de que quieres duplicar este registro?\')">
                   <i class="la la-copy"></i> Duplicar
                </a>';
    }
}
