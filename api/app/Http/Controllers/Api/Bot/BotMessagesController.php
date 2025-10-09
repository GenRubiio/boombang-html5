<?php

namespace App\Http\Controllers\Api\Bot;

use Exception;
use App\Models\BotMessage;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class BotMessagesController extends Controller
{
    use ResponseApiControllerTrait;

    /**
     * Save a bot message
     */
    public function store(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'sender_type' => 'required|in:user,bot',
                'sender_id' => 'required|integer',
                'content' => 'required|string',
                'language' => 'nullable|string',
                'metadata' => 'nullable|array',
            ]);

            $message = BotMessage::create($validated);

            return $this->successResponse([
                'message' => $message,
            ]);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Get messages for a bot-user conversation
     */
    public function index(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'bot_id' => 'required|integer',
                'user_id' => 'required|integer', 
                'limit' => 'nullable|integer|min:1|max:100',
            ]);

            $messages = BotMessage::conversation($validated['bot_id'], $validated['user_id'])
                ->orderBy('created_at', 'desc')
                ->limit($validated['limit'] ?? 50)
                ->get()
                ->reverse()
                ->values();

            return $this->successResponse([
                'messages' => $messages,
            ]);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
