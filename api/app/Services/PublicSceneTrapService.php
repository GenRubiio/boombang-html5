<?php

namespace App\Services;

use App\Models\PublicSceneTrap;

class PublicSceneTrapService
{
    /**
     * Obtiene todas las trampas activas de una escena pública
     */
    public function getActiveTrapsForScene(int $publicSceneId): array
    {
        return PublicSceneTrap::where('public_scene_id', $publicSceneId)
            ->where('active', true)
            ->get()
            ->toArray();
    }

    /**
     * Verifica si existe una trampa en una posición específica
     */
    public function getTrapAtPosition(int $publicSceneId, int $positionX, int $positionY): ?PublicSceneTrap
    {
        return PublicSceneTrap::where('public_scene_id', $publicSceneId)
            ->where('position_x', $positionX)
            ->where('position_y', $positionY)
            ->where('active', true)
            ->first();
    }

    /**
     * Obtiene todas las trampas de una escena (incluidas las inactivas)
     */
    public function getAllTrapsForScene(int $publicSceneId): array
    {
        return PublicSceneTrap::where('public_scene_id', $publicSceneId)
            ->get()
            ->toArray();
    }
}
