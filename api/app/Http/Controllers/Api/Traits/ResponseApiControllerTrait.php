<?php

namespace App\Http\Controllers\Api\Traits;

use Exception;
use Illuminate\Http\Resources\Json\JsonResource;

trait ResponseApiControllerTrait
{
    private function successResponse(array $data, ?int $code = null): JsonResource
    {
        $data = array_merge($data, [
            'success' => true,
            'code' => $code
        ]);
        return new JsonResource($data);
    }

    private function errorResponse(string $message, ?int $code = null): JsonResource
    {
        return new JsonResource([
            'error' => $message,
            'success' => false,
            'code' => $code
        ]);
    }

    private function handleException(Exception $e): JsonResource
    {
        return new JsonResource(['error' => $e->getMessage(), 'code' => $e->getCode()]);
    }
}
