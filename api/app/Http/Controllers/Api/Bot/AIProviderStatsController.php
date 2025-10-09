<?php

namespace App\Http\Controllers\Api\Bot;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\AI\AIProviderManager;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class AIProviderStatsController extends Controller
{
    use ResponseApiControllerTrait;

    protected AIProviderManager $aiManager;

    public function __construct(AIProviderManager $aiManager)
    {
        $this->aiManager = $aiManager;
    }

    /**
     * Get usage statistics for all AI providers
     */
    public function stats(Request $request): JsonResource
    {
        try {
            $stats = $this->aiManager->getUsageStats();

            return $this->successResponse([
                'providers' => $stats,
                'date' => now()->format('Y-m-d'),
            ]);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
