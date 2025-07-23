<?php

namespace App\Traits\Resources;

use Illuminate\Http\Request;

trait DtoResourceTrait
{
    public function toDTO(): ?object
    {
        return !is_null(self::$data) ? (object)self::toArray(new Request(self::$data->toArray())) : null;
    }

    public static function collectionToDTO($data)
    {
        if (is_null($data)) {
            return null;
        }
        $currentClass = __CLASS__;
        return $data->map(fn ($object): object => (new $currentClass($object))->toDTO());
    }
}
