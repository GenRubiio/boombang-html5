<?php

namespace App\Http\Controllers\Api\Bot;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\BotConversationService;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class BotConsumeQuotaController extends Controller
{
    use ResponseApiControllerTrait;

    protected BotConversationService $botService;

    public function __construct(BotConversationService $botService)
    {
        $this->botService = $botService;
    }

    /**
     * Consume bot daily quota
     */
    public function consume(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'bot_id' => 'required|integer',
            ]);

            $this->botService->consumeQuota($validated['bot_id']);

            return $this->successResponse([
                'message' => 'Quota consumed successfully',
            ]);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
