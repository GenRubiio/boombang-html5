<?php

namespace App\Services;

class LanguageDetectionService
{
    /**
     * Detect language from text
     * 
     * @param string $text Text to analyze
     * @return string Language code (es, en, ru, ja, zh, ko)
     */
    public static function detect(string $text): string
    {
        if (empty($text)) {
            return 'en'; // Default to English
        }

        $cleanText = trim(strtolower($text));

        // Japanese detection (Hiragana, Katakana, Kanji)
        if (preg_match('/[\x{3040}-\x{309F}\x{30A0}-\x{30FF}\x{4E00}-\x{9FAF}]/u', $cleanText)) {
            return 'ja';
        }

        // Korean detection (Hangul)
        if (preg_match('/[\x{AC00}-\x{D7AF}\x{1100}-\x{11FF}\x{3130}-\x{318F}]/u', $cleanText)) {
            return 'ko';
        }

        // Chinese detection (CJK Unified Ideographs)
        if (preg_match('/[\x{4E00}-\x{9FFF}\x{3400}-\x{4DBF}]/u', $cleanText)) {
            return 'zh';
        }

        // Russian detection (Cyrillic)
        if (preg_match('/[\x{0400}-\x{04FF}]/u', $cleanText)) {
            return 'ru';
        }

        // Spanish vs English detection (simple heuristic)
        $spanishWords = '/\b(hola|que|como|esta|por|para|con|todo|hacer|poder|gracias|aqui|donde|cuando|quien|cual|muy|mas|menos|bien|mal|si|no|yo|tu|el|ella|nosotros|vosotros|ellos|ellas)\b/i';
        $englishWords = '/\b(hello|what|how|is|are|for|with|all|do|can|thanks|here|where|when|who|which|very|more|less|good|bad|yes|no|i|you|he|she|we|they)\b/i';

        $spanishMatches = preg_match_all($spanishWords, $cleanText);
        $englishMatches = preg_match_all($englishWords, $cleanText);

        if ($spanishMatches > $englishMatches) {
            return 'es';
        }

        return 'en'; // Default
    }

    /**
     * Get language name
     * 
     * @param string $code Language code
     * @return string Language name
     */
    public static function getLanguageName(string $code): string
    {
        $names = [
            'es' => 'Español',
            'en' => 'English',
            'ru' => 'Русский',
            'ja' => '日本語',
            'zh' => '中文',
            'ko' => '한국어',
        ];

        return $names[$code] ?? 'Unknown';
    }
}