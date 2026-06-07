<?php

namespace App\Http\Controllers\Api\Game\Lobby;

use Exception;
use App\Services\MailService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class MailApiController extends Controller
{
    use ResponseApiControllerTrait;

    protected $mailService;

    public function __construct(MailService $mailService)
    {
        $this->mailService = $mailService;
    }

    /**
     * Obtiene la lista de correos de un usuario
     * Endpoint: POST /api/lobby/mail/inbox
     */
    public function getInbox()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                throw new Exception('Usuario no autenticado');
            }

            $lang = $user->lang ?? app()->getLocale();
            app()->setLocale($lang);

            $mails = $this->mailService->getUserMails($user->id);
            $unreadCount = $this->mailService->getUnreadCount($user->id);

            return $this->successResponse([
                'mails' => $mails,
                'unread_count' => $unreadCount,
            ]);
        } catch (Exception $e) {
            Log::error('Error obteniendo correos del usuario', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Error al obtener los correos');
        }
    }

    /**
     * Marca un correo como leído
     * Endpoint: POST /api/lobby/mail/read
     */
    public function markAsRead()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                throw new Exception('Usuario no autenticado');
            }

            $lang = $user->lang ?? app()->getLocale();
            app()->setLocale($lang);

            $mailId = request('mail_id');

            if (!$mailId) {
                throw new Exception('mail_id es requerido');
            }

            $success = $this->mailService->markAsRead($mailId, $user->id);

            if ($success) {
                return $this->successResponse([
                    'message' => 'Correo marcado como leído',
                ]);
            }

            throw new Exception('No se pudo marcar el correo como leído');
        } catch (Exception $e) {
            Log::error('Error marcando correo como leído', [
                'user_id' => Auth::id(),
                'mail_id' => request('mail_id'),
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Error al marcar el correo como leído');
        }
    }

    /**
     * Reclama las recompensas de un correo
     * Endpoint: POST /api/lobby/mail/claim
     */
    public function claimReward()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                throw new Exception('Usuario no autenticado');
            }

            $lang = $user->lang ?? app()->getLocale();
            app()->setLocale($lang);

            $mailId = request('mail_id');

            if (!$mailId) {
                throw new Exception('mail_id es requerido');
            }

            $result = $this->mailService->claimReward($mailId, $user->id);

            if ($result['success']) {
                return $this->successResponse($result);
            }

            throw new Exception($result['message'] ?? 'No se pudieron reclamar las recompensas');
        } catch (Exception $e) {
            Log::error('Error reclamando recompensas', [
                'user_id' => Auth::id(),
                'mail_id' => request('mail_id'),
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Error al reclamar las recompensas: ' . $e->getMessage());
        }
    }

    /**
     * Obtiene el contador de correos no leídos
     * Endpoint: POST /api/lobby/mail/unread-count
     */
    public function getUnreadCount()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                throw new Exception('Usuario no autenticado');
            }

            $unreadCount = $this->mailService->getUnreadCount($user->id);

            return $this->successResponse([
                'unread_count' => $unreadCount,
            ]);
        } catch (Exception $e) {
            Log::error('Error obteniendo contador de correos no leídos', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Error al obtener el contador');
        }
    }
}
