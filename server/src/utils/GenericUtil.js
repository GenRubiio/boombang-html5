class GenericUtil {
    static generateHexadecimal() {
        const hex = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
        return hex;
    }
}

module.exports = GenericUtil;