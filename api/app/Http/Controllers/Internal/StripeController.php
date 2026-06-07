<?php

namespace App\Http\Controllers\Internal;

use App\Models\User;
use App\Models\CatalogItem;
use Illuminate\Http\Request;
use App\Models\UserCatalogItem;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\SocketNotificationService;

class StripeController extends Controller
{
    /**
     * Create Stripe checkout session for catalog item
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createCheckoutSession(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not authenticated',
            ], 401);
        }

        $request->validate([
            'catalog_item_id' => 'required|integer|exists:catalog_items,id',
            'quantity' => 'integer|min:1',
        ]);

        $catalogItemId = $request->input('catalog_item_id');
        $quantity = (int) $request->input('quantity', 1);

        // Buscar el item del catálogo
        $catalogItem = CatalogItem::find($catalogItemId);

        if (!$catalogItem) {
            return response()->json([
                'success' => false,
                'error' => 'Catalog item not found',
            ], 404);
        }

        // Verificar que el item está activo y es comprable
        if (!$catalogItem->is_active || !$catalogItem->is_purchasable) {
            return response()->json([
                'success' => false,
                'error' => 'Item is not available for purchase',
            ], 400);
        }

        // Verificar que es un item de pago Stripe
        if ($catalogItem->price_type !== 'stripe_payment') {
            return response()->json([
                'success' => false,
                'error' => 'This item is not available for Stripe payment',
            ], 400);
        }

        // Verificar si permite compra múltiple
        if (!$catalogItem->is_multi_buy && $quantity > 1) {
            return response()->json([
                'success' => false,
                'error' => 'This item does not support multiple purchases',
            ], 400);
        }

        // Verificar límites de cantidad
        if ($quantity < $catalogItem->min_purchase_quantity) {
            return response()->json([
                'success' => false,
                'error' => "Minimum quantity is {$catalogItem->min_purchase_quantity}",
            ], 400);
        }

        if ($quantity > $catalogItem->max_purchase_quantity) {
            return response()->json([
                'success' => false,
                'error' => "Maximum quantity is {$catalogItem->max_purchase_quantity}",
            ], 400);
        }

        // Verificar que tiene precio en USD configurado
        if (!$catalogItem->stripe_price_usd || $catalogItem->stripe_price_usd <= 0) {
            return response()->json([
                'success' => false,
                'error' => 'Item does not have a valid USD price configured',
            ], 400);
        }

        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            // Calcular el precio total en centavos
            $totalPriceUsd = $catalogItem->stripe_price_usd * $quantity;
            $totalPriceCents = (int) round($totalPriceUsd * 100);

            // URLs de retorno
            $successUrl = url('/stripe-success?session_id={CHECKOUT_SESSION_ID}');
            $cancelUrl = url('/stripe-cancel');

            // Crear Checkout Session
            $checkoutSession = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $catalogItem->name,
                            'description' => strip_tags($catalogItem->description ?: 'Game item'),
                            'images' => $catalogItem->image ? [urlDocker($catalogItem->image)] : [],
                        ],
                        'unit_amount' => (int) round($catalogItem->stripe_price_usd * 100),
                    ],
                    'quantity' => $quantity,
                ]],
                'mode' => 'payment',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'metadata' => [
                    'user_id' => $user->id,
                    'catalog_item_id' => $catalogItem->id,
                    'quantity' => $quantity,
                    'item_name' => $catalogItem->name,
                ],
            ]);

            return response()->json([
                'success' => true,
                'checkout_url' => $checkoutSession->url,
                'session_id' => $checkoutSession->id,
                'amount' => $totalPriceUsd,
                'currency' => 'usd',
                'item' => [
                    'id' => $catalogItem->id,
                    'name' => $catalogItem->name,
                    'price_usd' => $catalogItem->stripe_price_usd,
                    'quantity' => $quantity,
                    'total' => $totalPriceUsd,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to create payment intent',
            ], 500);
        }
    }

    /**
     * Handle successful Stripe payment and deliver rewards
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handlePaymentSuccess(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'User not authenticated',
            ], 401);
        }

        $request->validate([
            'session_id' => 'required|string',
        ]);

        try {
            \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

            // Verificar la Checkout Session con Stripe
            $checkoutSession = \Stripe\Checkout\Session::retrieve($request->session_id);

            if ($checkoutSession->payment_status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'error' => 'Payment not completed successfully',
                ], 400);
            }

            // Verificar si ya se procesó este pago usando el log
            $existingPayment = \Illuminate\Support\Facades\Cache::remember(
                "stripe_payment_{$checkoutSession->id}", 
                3600, // 1 hora
                function() use ($checkoutSession) {
                    // Buscar en logs si ya se procesó
                    return null;
                }
            );

            // Si encontramos que ya se procesó, devolver success sin volver a procesar
            if ($existingPayment) {
                // Refrescar usuario y devolver estado actual
                $user->refresh();
                return response()->json([
                    'success' => true,
                    'message' => 'Payment already processed',
                    'user' => [
                        'gold' => $user->gold_coins,
                        'silver' => $user->silver_coins,
                    ],
                ]);
            }

            // Extraer metadata del pago
            $metadata = $checkoutSession->metadata;
            $catalogItemId = (int) $metadata['catalog_item_id'];
            $quantity = (int) $metadata['quantity'];
            $userId = (int) $metadata['user_id'];

            // Verificar que el usuario coincide
            if ($userId !== $user->id) {
                return response()->json([
                    'success' => false,
                    'error' => 'Payment user mismatch',
                ], 400);
            }

            // Buscar el item del catálogo
            $catalogItem = CatalogItem::find($catalogItemId);

            if (!$catalogItem) {
                return response()->json([
                    'success' => false,
                    'error' => 'Catalog item not found',
                ], 404);
            }

            DB::beginTransaction();

            try {
                // Entregar recompensas según el tipo configurado
                $this->deliverRewards($user, $catalogItem, $quantity);

                // Marcar como procesado en cache para evitar duplicados
                \Illuminate\Support\Facades\Cache::put(
                    "stripe_payment_{$checkoutSession->id}", 
                    true, 
                    3600 // 1 hora
                );

                DB::commit();

                // Refrescar el usuario para obtener los valores actualizados
                $user->refresh();

                // Notificar al socket para actualizar créditos en tiempo real
                SocketNotificationService::notifyCreditsUpdate($user);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment processed successfully and rewards delivered',
                    'user' => [
                        'gold' => $user->gold_coins,
                        'silver' => $user->silver_coins,
                    ],
                    'delivered_rewards' => $this->getRewardInfo($catalogItem, $quantity),
                ]);

            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'error' => 'Payment successful but failed to deliver rewards. Contact support.',
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to verify payment',
            ], 500);
        }
    }

    /**
     * Deliver rewards based on the item's reward type
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\CatalogItem  $catalogItem
     * @param  int  $quantity
     * @return void
     */
    private function deliverRewards(User $user, CatalogItem $catalogItem, int $quantity)
    {
        switch ($catalogItem->reward_type) {
            case 'item':
                // Entregar el item al inventario
                for ($i = 0; $i < $quantity; $i++) {
                    UserCatalogItem::create([
                        'user_id' => $user->id,
                        'catalog_item_id' => $catalogItem->id,
                        'show_in_inventory' => $catalogItem->show_in_inventory ?? true,
                    ]);
                }
                break;

            case 'golden_coins':
                // Entregar créditos de oro
                $goldToGive = $catalogItem->reward_golden_coins * $quantity;
                $user->gold_coins += $goldToGive;
                $user->save();
                break;

            case 'silver_coins':
                // Entregar créditos de plata
                $silverToGive = $catalogItem->reward_silver_coins * $quantity;
                $user->silver_coins += $silverToGive;
                $user->save();
                break;

            case 'mixed':
                // Entregar tanto créditos como item
                for ($i = 0; $i < $quantity; $i++) {
                    UserCatalogItem::create([
                        'user_id' => $user->id,
                        'catalog_item_id' => $catalogItem->id,
                        'show_in_inventory' => $catalogItem->show_in_inventory ?? true,
                    ]);
                }
                
                $goldToGive = 0;
                $silverToGive = 0;
                
                if ($catalogItem->reward_golden_coins > 0) {
                    $goldToGive = $catalogItem->reward_golden_coins * $quantity;
                    $user->gold_coins += $goldToGive;
                }
                
                if ($catalogItem->reward_silver_coins > 0) {
                    $silverToGive = $catalogItem->reward_silver_coins * $quantity;
                    $user->silver_coins += $silverToGive;
                }
                
                $user->save();
                break;

            default:
                // Por defecto, entregar el item
                for ($i = 0; $i < $quantity; $i++) {
                    UserCatalogItem::create([
                        'user_id' => $user->id,
                        'catalog_item_id' => $catalogItem->id,
                        'show_in_inventory' => $catalogItem->show_in_inventory ?? true,
                    ]);
                }
                break;
        }
    }

    /**
     * Get information about the rewards that were delivered
     *
     * @param  \App\Models\CatalogItem  $catalogItem
     * @param  int  $quantity
     * @return array
     */
    private function getRewardInfo(CatalogItem $catalogItem, int $quantity)
    {
        $rewards = [];

        switch ($catalogItem->reward_type) {
            case 'item':
                $rewards[] = [
                    'type' => 'item',
                    'name' => $catalogItem->name,
                    'quantity' => $quantity,
                ];
                break;

            case 'golden_coins':
                $rewards[] = [
                    'type' => 'golden_coins',
                    'amount' => $catalogItem->reward_golden_coins * $quantity,
                ];
                break;

            case 'silver_coins':
                $rewards[] = [
                    'type' => 'silver_coins',
                    'amount' => $catalogItem->reward_silver_coins * $quantity,
                ];
                break;

            case 'mixed':
                $rewards[] = [
                    'type' => 'item',
                    'name' => $catalogItem->name,
                    'quantity' => $quantity,
                ];
                
                if ($catalogItem->reward_golden_coins > 0) {
                    $rewards[] = [
                        'type' => 'golden_coins',
                        'amount' => $catalogItem->reward_golden_coins * $quantity,
                    ];
                }
                
                if ($catalogItem->reward_silver_coins > 0) {
                    $rewards[] = [
                        'type' => 'silver_coins',
                        'amount' => $catalogItem->reward_silver_coins * $quantity,
                    ];
                }
                break;
        }

        return $rewards;
    }

    /**
     * Handle Stripe success callback page
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function stripeSuccessPage(Request $request)
    {
        $sessionId = $request->get('session_id');
        
        if (!$sessionId) {
            return view('stripe.callback', [
                'type' => 'error',
                'message' => 'Session ID not found.',
                'sessionId' => null
            ]);
        }

        return view('stripe.callback', [
            'type' => 'success',
            'message' => null,
            'sessionId' => $sessionId
        ]);
    }

    /**
     * Handle Stripe cancel callback page
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function stripeCancelPage(Request $request)
    {
        return view('stripe.callback', [
            'type' => 'cancel',
            'message' => 'Payment was cancelled by the user.',
            'sessionId' => null
        ]);
    }


}