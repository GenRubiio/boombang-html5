export function useGoogleSignIn() {
    const initGoogle = (clientId) => {
        return new Promise((resolve) => {
            if (!window.google?.accounts?.id) {
                console.error("Google Identity Services no cargó todavía.");
                resolve(null);
                return;
            }

            const handleCredentialResponse = (response) => {
                if (response.credential) {
                    resolve(response.credential);
                } else {
                    console.error("No credential in response", response);
                    resolve(null);
                }
            };

            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
                auto_select: false,
                context: "signin",
            });
        });
    };

    return { initGoogle };
}
