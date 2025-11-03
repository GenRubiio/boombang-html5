<?php

namespace App\Services;

use App\Models\Mail;
use App\Models\MailRecipient;
use App\Models\MailReward;
use App\Models\User;
use App\Models\UserCatalogItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MailService
{
    /**
     * Obtiene todos los correos de un usuario (incluyendo los de "enviar a todos")
     */
    public function getUserMails(int $userId)
    {
        // Obtener la fecha de creación del usuario
        $user = User::find($userId);
        $userCreatedAt = $user ? $user->created_at : null;

        // Obtener correos específicos del usuario
        $specificMails = MailRecipient::where('user_id', $userId)
            ->with([
                'mail' => function ($query) {
                    $query->active()->with('rewards.catalogItem');
                }
            ])
            ->get()
            ->pluck('mail')
            ->filter(); // Eliminar nulls

        // Obtener correos para todos los usuarios
        $generalMails = Mail::active()
            ->sendToAll()
            ->with('rewards.catalogItem')
            ->get()
            ->filter(function ($mail) use ($userCreatedAt) {
                // Si el correo no es persistente, solo mostrarlo si fue creado después del usuario
                if (!$mail->is_persistent && $userCreatedAt) {
                    return $mail->created_at >= $userCreatedAt;
                }
                // Si es persistente, siempre mostrarlo
                return true;
            });

        // Para los correos generales, necesitamos crear o buscar el registro del recipient
        foreach ($generalMails as $mail) {
            $recipient = MailRecipient::firstOrCreate(
                [
                    'mail_id' => $mail->id,
                    'user_id' => $userId,
                ],
                [
                    'is_read' => false,
                    'is_claimed' => false,
                ]
            );

            // Añadir los datos del recipient al mail
            $mail->recipient_data = $recipient;
        }

        // Combinar y eliminar duplicados
        $allMails = $specificMails->merge($generalMails)->unique('id')->values();

        return $allMails->map(function ($mail) use ($userId) {
            // Obtener el estado del recipient
            $recipient = MailRecipient::where('mail_id', $mail->id)
                ->where('user_id', $userId)
                ->first();

            return [
                'id' => $mail->id,
                'title' => $mail->title,
                'description' => $mail->description,
                'gold_coins' => $mail->gold_coins ?? 0,
                'silver_coins' => $mail->silver_coins ?? 0,
                'rewards' => $mail->rewards->map(function ($reward) {
                    return [
                        'catalog_item_id' => $reward->catalog_item_id,
                        'quantity' => $reward->quantity,
                        'item' => $reward->catalogItem ? [
                            'id' => $reward->catalogItem->id,
                            'name' => $reward->catalogItem->name,
                            'image' => $reward->catalogItem->image,
                            'image_url' => urlDocker($reward->catalogItem->image),
                            'sprite_name' => $reward->catalogItem->sprite_name,
                        ] : null,
                    ];
                }),
                'is_read' => $recipient->is_read ?? false,
                'is_claimed' => $recipient->is_claimed ?? false,
                'claimed_at' => $recipient->claimed_at ?? null,
                'created_at' => $mail->created_at,
            ];
        });
    }

    /**
     * Marca un correo como leído para un usuario
     */
    public function markAsRead(int $mailId, int $userId)
    {
        $recipient = MailRecipient::where('mail_id', $mailId)
            ->where('user_id', $userId)
            ->first();

        if (!$recipient) {
            // Si no existe, crearlo (para el caso de send_to_all)
            $mail = Mail::find($mailId);
            if (!$mail || (!$mail->send_to_all)) {
                return false;
            }

            $recipient = MailRecipient::create([
                'mail_id' => $mailId,
                'user_id' => $userId,
                'is_read' => true,
                'is_claimed' => false,
            ]);
        } else {
            $recipient->is_read = true;
            $recipient->save();
        }

        return true;
    }

    /**
     * Reclama las recompensas de un correo
     */
    public function claimReward(int $mailId, int $userId)
    {
        DB::beginTransaction();

        try {
            // Verificar que el correo existe y está activo
            $mail = Mail::active()->find($mailId);
            if (!$mail) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => 'El correo no existe o no está disponible',
                ];
            }

            // Verificar que el usuario tiene acceso a este correo
            $recipient = MailRecipient::where('mail_id', $mailId)
                ->where('user_id', $userId)
                ->first();

            if (!$recipient) {
                // Si no existe y el correo es para todos, crearlo
                if ($mail->send_to_all) {
                    $recipient = MailRecipient::create([
                        'mail_id' => $mailId,
                        'user_id' => $userId,
                        'is_read' => true,
                        'is_claimed' => false,
                    ]);
                } else {
                    DB::rollBack();
                    return [
                        'success' => false,
                        'message' => 'No tienes acceso a este correo',
                    ];
                }
            }

            // Verificar que no ha sido reclamado previamente
            if ($recipient->is_claimed) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => 'Las recompensas ya han sido reclamadas',
                ];
            }

            // Obtener el usuario
            $user = User::find($userId);
            if (!$user) {
                DB::rollBack();
                return [
                    'success' => false,
                    'message' => 'Usuario no encontrado',
                ];
            }

            // Entregar monedas de oro
            if ($mail->gold_coins > 0) {
                $user->gold_coins += $mail->gold_coins;
            }

            // Entregar monedas de plata
            if ($mail->silver_coins > 0) {
                $user->silver_coins += $mail->silver_coins;
            }

            $user->save();

            // Entregar items del catálogo
            $rewards = MailReward::where('mail_id', $mailId)->with('catalogItem')->get();
            foreach ($rewards as $reward) {
                // Crear múltiples registros individuales según la cantidad
                for ($i = 0; $i < $reward->quantity; $i++) {
                    UserCatalogItem::create([
                        'user_id' => $userId,
                        'catalog_item_id' => $reward->catalog_item_id,
                        // No incluimos quantity porque cada registro representa un item individual
                    ]);
                }
            }

            // Marcar como reclamado
            $recipient->is_claimed = true;
            $recipient->is_read = true;
            $recipient->claimed_at = now();
            $recipient->save();

            DB::commit();

            return [
                'success' => true,
                'message' => 'Recompensas reclamadas exitosamente',
                'rewards' => [
                    'gold_coins' => $mail->gold_coins ?? 0,
                    'silver_coins' => $mail->silver_coins ?? 0,
                    'items' => $rewards->map(function ($reward) {
                        return [
                            'catalog_item_id' => $reward->catalog_item_id,
                            'quantity' => $reward->quantity,
                            'item' => $reward->catalogItem ? [
                                'id' => $reward->catalogItem->id,
                                'name' => $reward->catalogItem->name,
                                'image' => $reward->catalogItem->image,
                                'image_url' => urlDocker($reward->catalogItem->image),
                                'sprite_name' => $reward->catalogItem->sprite_name,
                            ] : null,
                        ];
                    }),
                ],
                'user' => [
                    'gold_coins' => $user->gold_coins,
                    'silver_coins' => $user->silver_coins,
                ],
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error reclamando recompensas de correo', [
                'mail_id' => $mailId,
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Error al reclamar las recompensas: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Obtiene el número de correos no leídos de un usuario
     */
    public function getUnreadCount(int $userId)
    {
        // Obtener la fecha de creación del usuario
        $user = User::find($userId);
        $userCreatedAt = $user ? $user->created_at : null;

        // Correos específicos no leídos (incluye send_to_all que ya tienen recipient)
        $specificUnread = MailRecipient::where('user_id', $userId)
            ->unread()
            ->whereHas('mail', function ($query) {
                $query->active();
            })
            ->count();

        // Correos para todos que NO tienen ningún recipient para este usuario
        $generalUnread = Mail::active()
            ->sendToAll()
            ->whereDoesntHave('recipients', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->where(function ($query) use ($userCreatedAt) {
                // Solo incluir correos persistentes O correos creados después del usuario
                if ($userCreatedAt) {
                    $query->where('is_persistent', true)
                        ->orWhere('created_at', '>=', $userCreatedAt);
                }
            })
            ->count();

        return $specificUnread + $generalUnread;
    }

    /**
     * Crea un correo y lo asigna a usuarios específicos o a todos
     */
    public function createMail(array $data)
    {
        DB::beginTransaction();

        try {
            // Crear el correo
            $mail = Mail::create([
                'title' => $data['title'],
                'description' => $data['description'],
                'is_active' => $data['is_active'] ?? true,
                'send_to_all' => $data['send_to_all'] ?? false,
                'is_persistent' => $data['is_persistent'] ?? false,
                'gold_coins' => $data['gold_coins'] ?? 0,
                'silver_coins' => $data['silver_coins'] ?? 0,
            ]);

            // Añadir recompensas (items del catálogo)
            if (isset($data['rewards']) && is_array($data['rewards'])) {
                foreach ($data['rewards'] as $reward) {
                    MailReward::create([
                        'mail_id' => $mail->id,
                        'catalog_item_id' => $reward['catalog_item_id'],
                        'quantity' => $reward['quantity'] ?? 1,
                    ]);
                }
            }

            // Añadir destinatarios específicos (solo si no es send_to_all)
            if (!$mail->send_to_all && isset($data['user_ids']) && is_array($data['user_ids'])) {
                foreach ($data['user_ids'] as $userId) {
                    MailRecipient::create([
                        'mail_id' => $mail->id,
                        'user_id' => $userId,
                        'is_read' => false,
                        'is_claimed' => false,
                    ]);
                }
            }

            DB::commit();

            return [
                'success' => true,
                'mail' => $mail,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creando correo', [
                'data' => $data,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Error al crear el correo',
            ];
        }
    }
}
