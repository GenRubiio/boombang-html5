export function useGoogleSignIn() {
    const loadGoogleScript = () => {
        return new Promise((resolve) => {
            if (document.getElementById('google-identity-services-script')) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.id = 'google-identity-services-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    };

    const initGoogle = async (clientId, callback) => {
        await loadGoogleScript();

        if (!window.google?.accounts?.id) {
            console.error("Google Identity Services no cargó todavía.");
            return;
        }

        const handleCredentialResponse = (response) => {
            if (response.credential) {
                callback(response.credential);
            } else {
                console.error("No credential in response", response);
                callback(null);
            }
        };

        google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            context: "signin",
            use_fedcm_for_prompt: true,
            allowed_parent_origin: ["https://www.boommania.com"]
        });
    };

    return { initGoogle };
}
