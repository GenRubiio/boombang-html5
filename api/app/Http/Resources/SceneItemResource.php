<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\Traits\DtoResourceTrait;
use App\Models\Event;
use Illuminate\Http\Resources\Json\JsonResource;

class SceneItemResource extends JsonResource
{
    use DtoResourceTrait;

    private static $data;

    public function __construct($resource)
    {
        parent::__construct($resource);
        self::$data = $resource;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => (int)$this->id,
            'name' => $this->name,
            'file_name' => $this->file_name,
            'sprite_file' => $this->sprite_file,
            'sprite_file_url' => urlDocker($this->sprite_file),
            'catch_sprite_file' => $this->catch_sprite_file,
            'catch_sprite_file_url' => urlDocker($this->catch_sprite_file),
            'catch_file_name' => $this->catch_file_name,
            'text' => $this->text,
            'points' => $this->whenPivotLoaded('public_scene_items', function () {
                return (int)$this->pivot->sum_points;
            }),
            'activate_time' => $this->whenPivotLoaded('public_scene_items', function () {
                return (int)$this->pivot->activate_time;
            }),
            'desactivate_time' => $this->whenPivotLoaded('public_scene_items', function () {
                return (int)$this->pivot->desactivate_time;
            }),
            'min_users' => $this->whenPivotLoaded('public_scene_items', function () {
                return (int)$this->pivot->min_users;
            }),
            'active' => $this->whenPivotLoaded('public_scene_items', function () {
                if ($this->pivot->event_id) {
                    $event = Event::find($this->pivot->event_id);
                    if ($event) {
                        $now = now();
                        if ($now->lt($event->start_time) || $now->gt($event->end_time)) {
                            return false;
                        }
                    }
                }
                return true;
            }) ?? true,
        ];
    }
}
