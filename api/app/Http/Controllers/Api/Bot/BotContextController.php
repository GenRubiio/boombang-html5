<?php

namespace App\Http\Controllers\Api\Bot;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\BotConversationService;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class BotContextController extends Controller
{
    use ResponseApiControllerTrait;

    protected BotConversationService $botService;

    public function __construct(BotConversationService $botService)
    {
        $this->botService = $botService;
    }

    /**
     * Get context for bot response (facts, recent messages)
     * No room tracking needed
     */
    public function getContext(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'bot_id' => 'required|integer',
                'user_id' => 'required|integer',
            ]);

            $context = $this->botService->getContext(
                $validated['bot_id'],
                $validated['user_id']
            );

            // Format context for response
            $formattedContext = [
                'bot' => [
                    'id' => $context['bot']->id,
                    'name' => $context['bot']->name,
                    'system_prompt' => $context['bot']->system_prompt,
                ],
                'facts' => $context['facts'],
                'recent_messages' => $context['recent_messages']->map(function ($msg) {
                    return [
                        'sender_type' => $msg->sender_type,
                        'sender_id' => $msg->sender_id,
                        'content' => $msg->content,
                        'created_at' => $msg->created_at->toIso8601String(),
                    ];
                }),
            ];

            return $this->successResponse($formattedContext);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
