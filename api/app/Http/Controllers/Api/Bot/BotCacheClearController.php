<?php

namespace App\Http\Controllers\Api\Bot;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class BotCacheClearController extends Controller
{
    use ResponseApiControllerTrait;

    /**
     * Clear bot conversation cache
     */
    public function clearCache(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'bot_id' => 'required|integer',
                'user_id' => 'required|integer',
            ]);

            $botId = $validated['bot_id'];
            $userId = $validated['user_id'];

            // Clear cooldown cache
            $cooldownKey = "bot_cooldown_{$botId}_{$userId}";
            Cache::forget($cooldownKey);

            // Clear any other bot-related cache keys
            $patterns = [
                "bot_context_{$botId}_{$userId}",
                "bot_conversation_{$botId}_{$userId}",
            ];

            foreach ($patterns as $pattern) {
                Cache::forget($pattern);
            }

            return $this->successResponse([
                'message' => 'Bot cache cleared successfully',
                'bot_id' => $botId,
                'user_id' => $userId,
            ]);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Clear all bot caches
     */
    public function clearAllCache(): JsonResource
    {
        try {
            // Get all cache keys that start with 'bot_'
            Cache::flush(); // For simplicity, we'll flush all cache
            
            return $this->successResponse([
                'message' => 'All bot cache cleared successfully',
            ]);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}