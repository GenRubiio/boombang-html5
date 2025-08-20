// Evita inicializar GIS más de una vez por carga del iframe
let gisInitialized = false;

export function useGoogleSignIn() {
    /**
     * Inicializa GIS (una vez).
     * @param {string} clientId - VITE_GOOGLE_CLIENT_ID
     * @param {(credential:string)=>void} onCredential - callback cuando Google devuelve el ID token
     * @param {string[]} parentOrigins - orígenes del documento PADRE (sin rutas)
     */
    const initGoogle = (clientId, onCredential, parentOrigins = ["https://www.boommania.com"]) => {
        if (gisInitialized) return true;

        if (!window.google?.accounts?.id) {
            console.error("GIS no cargó todavía. Asegúrate de tener <script src='https://accounts.google.com/gsi/client' async defer></script> en el IFRAME.");
            return false;
        }

        const handleCredentialResponse = (response) => {
            const cred = response?.credential ?? null;
            if (!cred) {
                console.warn("GIS: respuesta sin credential", response);
                return;
            }
            try { onCredential && onCredential(cred); } catch (e) { console.error(e); }
        };

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            context: "signin",
            use_fedcm_for_prompt: true,
            allowed_parent_origin: parentOrigins,
        });

        gisInitialized = true;
        return true;
    };

    const renderGoogleButton = (elementId = "google-btn") => {
        if (!window.google?.accounts?.id) return;
        const el = document.getElementById(elementId);
        if (!el) return;
        window.google.accounts.id.renderButton(el, {
            type: "standard",
            theme: "outline",
            size: "large",
        });
    };

    return { initGoogle, renderGoogleButton };
}
