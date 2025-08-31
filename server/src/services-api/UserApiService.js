const ApiService = require('./ApiService');

class UserApiService {
    static async login(username, password) {
        try {
            const data = {
                username: username,
                password: password
            };
            return await ApiService.post('api/auth/login', data);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                return error.response.data;
            }
            console.error('Error en el login:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async loginWithGoogle(authToken) {
        try {
            const data = {
                auth_token: authToken
            };
            return await ApiService.post('api/auth/google', data);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                return error.response.data;
            }
            console.error('Error en el login con Google:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async register(username, email, password, avatar, recaptcha, lang) {
        try {
            const data = {
                username: username,
                email: email,
                password: password,
                avatar_id: avatar,
                recaptcha: recaptcha,
                lang: lang
            };
            return await ApiService.post('api/auth/register', data);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                return error.response.data;
            }
            console.error('Error en el registro:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async increaseStats(user, statsType) {
        try {
            const data = {
                stats_type: statsType
            };
            return await ApiService.post('api/user/increase-stats', data, user.authJwt);
        } catch (error) {
            console.error('Error al aumentar las estadísticas del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async updateDescription(user, newDescription) {
        try {
            const data = {
                description: newDescription
            };
            return await ApiService.post('api/user/update-description', data, user.authJwt);
        } catch (error) {
            console.error('Error al actualizar la descripción del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async changeFicha(user, newFicha) {
        try {
            const data = {
                ficha_color: newFicha
            };
            return await ApiService.post('api/user/change-ficha', data, user.authJwt);
        } catch (error) {
            console.error('Error al cambiar la ficha del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async changeChat(user, newChat) {
        try {
            const data = {
                chat_color: newChat
            };
            return await ApiService.post('api/user/change-chat', data, user.authJwt);
        } catch (error) {
            console.error('Error al cambiar el chat del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async changeNameColor(user, newNameColor) {
        try {
            const data = {
                name_color: newNameColor
            };
            return await ApiService.post('api/user/change-colorname', data, user.authJwt);
        } catch (error) {
            console.error('Error al cambiar el color del nombre del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async changeShadowColor(user, newShadowColor) {
        try {
            const data = {
                shadow_color: newShadowColor
            };
            return await ApiService.post('api/user/change-shadowcolor', data, user.authJwt);
        } catch (error) {
            console.error('Error al cambiar el color de la sombra del usuario:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async jwtAutoLogin(authJwt) {
        try {
            const data = {
                auth_token: authJwt
            };
            return await ApiService.post('api/auth/jwt-auto-login', data, authJwt);
        } catch (error) {
            console.error('Error en el inicio de sesión automático con JWT:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    static async logout(user) {
        try {
            return await ApiService.post('api/auth/logout', {}, user.authJwt);
        } catch (error) {
            console.error('Error al cerrar sesión:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = UserApiService;