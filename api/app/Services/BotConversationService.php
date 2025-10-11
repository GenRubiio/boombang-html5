<?php

namespace App\Services;

use Exception;
use App\Models\User;
use App\Models\BotMessage;
use App\Models\BotFact;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Services\AI\AIProviderManager;

class BotConversationService
{
    protected AIProviderManager $aiManager;

    public function __construct(AIProviderManager $aiManager)
    {
        $this->aiManager = $aiManager;
    }

    /**
     * Check if bot can reply (quota and cooldown)
     */
    public function canReply(int $botId, int $userId): array
    {
        $bot = User::where('is_bot', true)->findOrFail($botId);

        if (!$bot->active) {
            return ['ok' => false, 'reason' => 'Bot is not active'];
        }

        // Check daily quota
        $dailyUsage = $this->getDailyUsage($botId);
        $dailyQuota = $bot->getDailyQuota();

        if ($dailyUsage >= $dailyQuota) {
            return ['ok' => false, 'reason' => 'Daily quota exceeded'];
        }

        // Check cooldown (per bot-user pair)
        $cooldownKey = "bot_cooldown_{$botId}_{$userId}";
        if (Cache::has($cooldownKey)) {
            return ['ok' => false, 'reason' => 'Cooldown active'];
        }

        return ['ok' => true];
    }

    /**
     * Get context for bot response
     */
    public function getContext(int $botId, int $userId): array
    {
        $bot = User::where('is_bot', true)->findOrFail($botId);

        // Get recent messages between this specific bot and user (last 2 only to save tokens)
        $recentMessages = BotMessage::conversation($botId, $userId)
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get()
            ->reverse()
            ->values();

        // Get facts
        $facts = BotFact::where('bot_id', $botId)
            ->where('user_id', $userId)
            ->orderBy('confidence', 'desc')
            ->limit(5)
            ->pluck('fact')
            ->toArray();

        return [
            'bot' => $bot,
            'recent_messages' => $recentMessages,
            'facts' => $facts,
        ];
    }

    /**
     * Generate bot response
     */
    public function generateResponse(
        int $botId,
        int $userId,
        string $userMessage,
        string $detectedLanguage
    ): array {
        $context = $this->getContext($botId, $userId);
        $bot = $context['bot'];

        $systemPrompt = $this->buildSystemPrompt($bot, $context, $detectedLanguage);
        $messages = $this->buildMessages($context['recent_messages'], $userMessage);

        try {
            $aiResponse = $this->aiManager->generateWithFallback(
                $systemPrompt,
                $messages,
                [
                    'temperature' => 0.8,
                    'max_tokens' => 150,  // Aumentado para evitar error de Gemini
                    'top_p' => 0.9,
                ]
            );

            $responseText = $aiResponse['content'];

            // Save messages (NO room_id)
            $this->saveMessage('user', $userId, $userMessage, $detectedLanguage);
            $this->saveMessage('bot', $botId, $responseText, $detectedLanguage, [
                'provider' => $aiResponse['provider'],
                'model' => $aiResponse['model'],
                'tokens' => $aiResponse['tokens'],
            ]);

            // Increment usage and set cooldown (increased cooldown to prevent rapid responses)
            $this->incrementDailyUsage($botId);
            $cooldownSeconds = max($bot->getCooldownSeconds(), 5); // Minimum 5 seconds cooldown
            $this->setCooldown($botId, $userId, $cooldownSeconds);

            return [
                'success' => true,
                'response' => $responseText,
                'meta' => [
                    'provider' => $aiResponse['provider'],
                    'model' => $aiResponse['model'],
                    'tokens' => $aiResponse['tokens'],
                    'language' => $detectedLanguage,
                ],
            ];

        } catch (Exception $e) {
            Log::error('Bot response generation failed', [
                'bot_id' => $botId,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    protected function buildSystemPrompt(User $bot, array $context, string $language): string
    {
        // NO usar system prompt - Gemini 2.5 gasta tokens pensando
        return "";
    }

    protected function buildMessages(object $recentMessages, string $currentMessage): array
    {
        // Start with just current message to minimize tokens
        $messages = [
            [
                'role' => 'user',
                'content' => $currentMessage,
            ]
        ];

        return $messages;
    }

    protected function saveMessage(
        string $senderType,
        int $senderId,
        string $content,
        string $language = null,
        array $metadata = []
    ): BotMessage {
        return BotMessage::create([
            'sender_type' => $senderType,
            'sender_id' => $senderId,
            'content' => $content,
            'language' => $language,
            'metadata' => $metadata,
        ]);
    }

    protected function getDailyUsage(int $botId): int
    {
        $dayKey = now()->format('Ymd');
        $usageKey = "bot_daily_usage_{$botId}_{$dayKey}";
        return (int) Cache::get($usageKey, 0);
    }

    protected function incrementDailyUsage(int $botId): void
    {
        $dayKey = now()->format('Ymd');
        $usageKey = "bot_daily_usage_{$botId}_{$dayKey}";
        $current = (int) Cache::get($usageKey, 0);
        Cache::put($usageKey, $current + 1, now()->endOfDay());
    }

    protected function setCooldown(int $botId, int $userId, int $seconds): void
    {
        $cooldownKey = "bot_cooldown_{$botId}_{$userId}";
        Cache::put($cooldownKey, true, $seconds);
    }

    public function consumeQuota(int $botId): void
    {
        $this->incrementDailyUsage($botId);
    }
}
