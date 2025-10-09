<?php

namespace App\Http\Controllers\Api\Bot;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\BotConversationService;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class BotAllowReplyController extends Controller
{
    use ResponseApiControllerTrait;

    protected BotConversationService $botService;

    public function __construct(BotConversationService $botService)
    {
        $this->botService = $botService;
    }

    /**
     * Check if bot can reply (quota and cooldown validation)
     * No room tracking - users move between rooms in the emulator
     */
    public function allowReply(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'bot_id' => 'required|integer',
                'user_id' => 'required|integer',
            ]);

            $result = $this->botService->canReply(
                $validated['bot_id'],
                $validated['user_id']
            );

            return $this->successResponse($result);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
