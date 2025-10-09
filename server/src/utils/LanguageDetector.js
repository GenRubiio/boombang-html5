/**
 * Language Detection Utility
 * Detects the language of a text message
 */

class LanguageDetector {
    /**
     * Detect language from text
     * @param {string} text - Text to analyze
     * @returns {string} Language code (es, en, ru, ja, zh, ko)
     */
    static detect(text) {
        if (!text || typeof text !== 'string') {
            return 'en'; // Default to English
        }

        const cleanText = text.trim().toLowerCase();

        // Japanese detection (Hiragana, Katakana, Kanji)
        if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(cleanText)) {
            return 'ja';
        }

        // Korean detection (Hangul)
        if (/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(cleanText)) {
            return 'ko';
        }

        // Chinese detection (CJK Unified Ideographs)
        if (/[\u4E00-\u9FFF\u3400-\u4DBF]/.test(cleanText)) {
            return 'zh';
        }

        // Russian detection (Cyrillic)
        if (/[\u0400-\u04FF]/.test(cleanText)) {
            return 'ru';
        }

        // Spanish vs English detection (simple heuristic)
        const spanishWords = /\b(hola|que|como|esta|por|para|con|todo|hacer|poder|gracias|aqui|donde|cuando|quien|cual|muy|mas|menos|bien|mal|si|no|yo|tu|el|ella|nosotros|vosotros|ellos|ellas)\b/i;
        const englishWords = /\b(hello|what|how|is|are|for|with|all|do|can|thanks|here|where|when|who|which|very|more|less|good|bad|yes|no|i|you|he|she|we|they)\b/i;

        const spanishMatches = (cleanText.match(spanishWords) || []).length;
        const englishMatches = (cleanText.match(englishWords) || []).length;

        if (spanishMatches > englishMatches) {
            return 'es';
        }

        return 'en'; // Default
    }

    /**
     * Get language name
     * @param {string} code - Language code
     * @returns {string} Language name
     */
    static getLanguageName(code) {
        const names = {
            es: 'Español',
            en: 'English',
            ru: 'Русский',
            ja: '日本語',
            zh: '中文',
            ko: '한국어',
        };
        return names[code] || 'Unknown';
    }
}

module.exports = LanguageDetector;
