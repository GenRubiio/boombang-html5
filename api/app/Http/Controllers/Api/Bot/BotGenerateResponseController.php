<?php

namespace App\Http\Controllers\Api\Bot;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\BotConversationService;
use App\Services\LanguageDetectionService;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class BotGenerateResponseController extends Controller
{
    use ResponseApiControllerTrait;

    protected BotConversationService $botService;

    public function __construct(BotConversationService $botService)
    {
        $this->botService = $botService;
    }

    /**
     * Generate bot response
     */
    public function generate(Request $request): JsonResource
    {
        try {
            $validated = $request->validate([
                'bot_id' => 'required|integer',
                'user_id' => 'required|integer',
                'message' => 'required|string|max:500',
            ]);

            // Detect language automatically from the message
            $detectedLanguage = LanguageDetectionService::detect($validated['message']);

            $result = $this->botService->generateResponse(
                $validated['bot_id'],
                $validated['user_id'],
                $validated['message'],
                $detectedLanguage
            );

            if (!$result['success']) {
                return $this->errorResponse($result['error'], 500);
            }

            return $this->successResponse([
                'success' => true,
                'response' => $result['response'],
                'meta' => $result['meta'],
            ]);

        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
