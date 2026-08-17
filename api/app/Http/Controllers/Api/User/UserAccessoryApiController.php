<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

/**
 * ACC3: ownership reuses the existing decoration model (enabledHats/Pets/Auras() on
 * User.php), grantable only through the existing Backpack admin process — no purchase or
 * currency flow exists here.
 */
class UserAccessoryApiController extends Controller
{
    use ResponseApiControllerTrait;

    private const COLUMN_BY_KIND = [
        'hat' => 'avatar_hat',
        'pet' => 'avatar_pet',
        'aura' => 'avatar_aura',
    ];

    public function list(Request $request): JsonResource
    {
        try {
            $user = Auth::user();
            return $this->successResponse([
                'owned' => [
                    'hat' => $user->enabledHats(),
                    'pet' => $user->enabledPets(),
                    'aura' => $user->enabledAuras(),
                ],
                'equipped' => [
                    'hat' => $user->avatar_hat,
                    'pet' => $user->avatar_pet,
                    'aura' => $user->avatar_aura,
                ],
            ]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function change(Request $request): JsonResource
    {
        try {
            $user = Auth::user();
            $kind = $request->input('kind');
            $value = $request->input('value');

            if (!array_key_exists($kind, self::COLUMN_BY_KIND)) {
                throw new Exception('Invalid accessory kind');
            }

            $ownedMethod = 'enabled' . ucfirst($kind) . 's';
            if ($value !== null && !in_array($value, $user->{$ownedMethod}())) {
                throw new Exception('Accessory not owned', 403);
            }

            $user->update([self::COLUMN_BY_KIND[$kind] => $value]);

            return $this->successResponse();
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
