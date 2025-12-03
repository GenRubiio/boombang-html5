<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Processing Payment...</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .success { color: #4CAF50; }
        .error { color: #f44336; }
        .cancel { color: #ff9800; }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h2>Processing Payment...</h2>
        <p id="status">Please wait while we process your payment.</p>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const type = "{{ $type }}";
            const sessionId = "{{ $sessionId ?? '' }}";
            const message = "{{ $message ?? '' }}";
            
            if (type === "success" && sessionId) {
                processSuccessfulPayment(sessionId);
            } else if (type === "cancel") {
                communicateWithParent("stripe_payment_cancel", { message: message || "Payment was cancelled" });
            } else if (type === "error") {
                communicateWithParent("stripe_payment_error", { message: message || "Payment error occurred" });
            }
        });

        async function processSuccessfulPayment(sessionId) {
            try {
                document.getElementById("status").textContent = "Requesting authentication...";
                requestJWTFromParent(sessionId);
            } catch (error) {
                document.getElementById("status").textContent = "Error: " + error.message;
                document.getElementById("status").className = "error";
                
                communicateWithParent("stripe_payment_error", {
                    message: error.message
                });
            }
        }
        
        function requestJWTFromParent(sessionId) {
            document.getElementById("status").textContent = "Connecting with application...";
            
            if (window.opener) {
                window.opener.postMessage({
                    type: "request_jwt_for_stripe",
                    sessionId: sessionId
                }, "*");
            }
            
            const timeout = setTimeout(() => {
                document.getElementById("status").textContent = "Error: Could not connect with the application";
                document.getElementById("status").className = "error";
                
                communicateWithParent("stripe_payment_error", {
                    message: "Could not get authentication from main application"
                });
            }, 10000);
            
            window.addEventListener("message", function(event) {
                if (event.data.type === "jwt_response" && event.data.jwt) {
                    clearTimeout(timeout);
                    processPaymentWithJWT(sessionId, event.data.jwt);
                } else if (event.data.type === "jwt_not_found") {
                    clearTimeout(timeout);
                    document.getElementById("status").textContent = "Error: User not authenticated";
                    document.getElementById("status").className = "error";
                    
                    communicateWithParent("stripe_payment_error", {
                        message: "User not authenticated. Please log in again."
                    });
                }
            });
        }
        
        async function processPaymentWithJWT(sessionId, jwt) {
            try {
                document.getElementById("status").textContent = "Verifying payment with Stripe...";
                
                const response = await fetch("/api/stripe/payment-success", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": "Bearer " + jwt
                    },
                    body: JSON.stringify({
                        session_id: sessionId
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById("status").textContent = "Payment processed successfully!";
                        document.getElementById("status").className = "success";
                        
                        communicateWithParent("stripe_payment_success", {
                            message: "Payment completed successfully",
                            user: data.user,
                            rewards: data.delivered_rewards
                        });
                        
                        setTimeout(() => {
                            window.close();
                        }, 2000);
                        
                    } else {
                        throw new Error(data.error || "Error processing payment");
                    }
                } else {
                    const errorText = await response.text();
                    throw new Error(`Server error (${response.status}): ${errorText}`);
                }
                
            } catch (error) {
                document.getElementById("status").textContent = "Error: " + error.message;
                document.getElementById("status").className = "error";
                
                communicateWithParent("stripe_payment_error", {
                    message: error.message
                });
            }
        }

        function communicateWithParent(messageType, data) {
            try {
                if (window.opener) {
                    window.opener.postMessage({
                        type: messageType,
                        ...data
                    }, "*");
                }
                
                if (window.parent !== window) {
                    window.parent.postMessage({
                        type: messageType,
                        ...data
                    }, "*");
                }
            } catch (error) {
                console.error("Error communicating with parent:", error);
            }
        }
    </script>
</body>
</html>