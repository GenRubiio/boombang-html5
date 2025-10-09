/**
 * Visual Width Calculator
 * Calculates the visual width of text in pixels for chat display
 */

class VisualWidthCalculator {
    /**
     * Character width mapping (approximate pixel widths)
     */
    static charWidths = {
        // Narrow characters
        narrow: ['i', 'l', 'I', '!', '.', ',', ':', ';', '|', '\'', ' '],
        // Wide characters
        wide: ['W', 'M', 'w', 'm', '@', '%', '&'],
        // Medium characters (default)
        medium: 'default',
    };

    static widthValues = {
        narrow: 4,
        medium: 8,
        wide: 12,
        cjk: 16, // Chinese, Japanese, Korean
        emoji: 20,
    };

    /**
     * Calculate visual width of text in pixels
     * @param {string} text - Text to measure
     * @param {number} fontSize - Font size (default: 14)
     * @returns {number} Approximate width in pixels
     */
    static calculate(text, fontSize = 14) {
        if (!text) return 0;

        let width = 0;
        const scaleFactor = fontSize / 14; // Base calculation on 14px font

        for (const char of text) {
            width += this.getCharWidth(char);
        }

        return Math.ceil(width * scaleFactor);
    }

    /**
     * Get width for a single character
     * @param {string} char - Character
     * @returns {number} Width in pixels
     */
    static getCharWidth(char) {
        const code = char.charCodeAt(0);

        // Emoji range
        if (code >= 0x1F300 && code <= 0x1F9FF) {
            return this.widthValues.emoji;
        }

        // CJK characters (Chinese, Japanese, Korean)
        if (
            (code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs
            (code >= 0x3040 && code <= 0x309F) || // Hiragana
            (code >= 0x30A0 && code <= 0x30FF) || // Katakana
            (code >= 0xAC00 && code <= 0xD7AF)    // Hangul
        ) {
            return this.widthValues.cjk;
        }

        // Narrow characters
        if (this.charWidths.narrow.includes(char)) {
            return this.widthValues.narrow;
        }

        // Wide characters
        if (this.charWidths.wide.includes(char)) {
            return this.widthValues.wide;
        }

        // Default medium width
        return this.widthValues.medium;
    }

    /**
     * Check if text exceeds maximum width
     * @param {string} text - Text to check
     * @param {number} maxWidth - Maximum width in pixels
     * @param {number} fontSize - Font size
     * @returns {boolean}
     */
    static exceedsWidth(text, maxWidth, fontSize = 14) {
        return this.calculate(text, fontSize) > maxWidth;
    }

    /**
     * Truncate text to fit within maximum width
     * @param {string} text - Text to truncate
     * @param {number} maxWidth - Maximum width in pixels
     * @param {number} fontSize - Font size
     * @param {string} suffix - Suffix to add when truncated (default: '...')
     * @returns {string} Truncated text
     */
    static truncate(text, maxWidth, fontSize = 14, suffix = '...') {
        if (!this.exceedsWidth(text, maxWidth, fontSize)) {
            return text;
        }

        const suffixWidth = this.calculate(suffix, fontSize);
        const availableWidth = maxWidth - suffixWidth;

        let truncated = '';
        let currentWidth = 0;

        for (const char of text) {
            const charWidth = this.getCharWidth(char);
            if (currentWidth + charWidth > availableWidth) {
                break;
            }
            truncated += char;
            currentWidth += charWidth;
        }

        return truncated + suffix;
    }
}

module.exports = VisualWidthCalculator;
