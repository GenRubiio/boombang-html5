<?php

namespace App\Http\Controllers\Api\Game\Lobby;

use Exception;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Enums\PhaserRenderingTypeEnum;
use App\Enums\PhaserPowerPreferenceEnum;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class SettingsUpdateApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function updateName()
    {
        try {
            $validated = request()->validate([
                'username' => 'required|unique:users,username|max:10',
            ]);

            $user = Auth::user();
            if ($user->last_update_username_at && now()->diffInDays($user->last_update_username_at) < 30) {
                throw new Exception('Debes esperar 30 días para cambiar tu nombre de usuario nuevamente.');
            }

            $user->username = $validated['username'];
            $user->last_update_username_at = now();
            $user->save();
            return $this->successResponse([]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function updateLang()
    {
        try {
            $user = Auth::user();
            $validated = request()->validate([
                'lang' => 'required|string|in:' . implode(',', array_keys(config('backpack.crud.locales'))),
            ]);
            if ($user->lang == $validated['lang']) {
                throw new Exception('El idioma seleccionado es el mismo que el actual.');
            }
            $user->lang = $validated['lang'];
            $user->save();
            return $this->successResponse([]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function updateGraphics()
    {
        try {
            $user = Auth::user();
            $validated = request()->validate([
                'phaser_rendering_type' => 'required|string|in:' . implode(',', array_keys(PhaserRenderingTypeEnum::toAssociativeArray())),
                'phaser_antialias' => 'required|boolean',
                'phaser_antialias_gl' => 'required|boolean',
                'phaser_pixel_art' => 'required|boolean',
                'phaser_round_pixels' => 'required|boolean',
                'phaser_power_preference' => 'required|string|in:' . implode(',', array_keys(PhaserPowerPreferenceEnum::toAssociativeArray())),
            ]);

            $user->phaser_rendering_type = PhaserRenderingTypeEnum::fromKey($validated['phaser_rendering_type'])->key();
            $user->phaser_antialias = $validated['phaser_antialias'];
            $user->phaser_antialias_gl = $validated['phaser_antialias_gl'];
            $user->phaser_pixel_art = $validated['phaser_pixel_art'];
            $user->phaser_round_pixels = $validated['phaser_round_pixels'];
            $user->phaser_power_preference = PhaserPowerPreferenceEnum::fromKey($validated['phaser_power_preference'])->key();
            $user->save();
            return $this->successResponse([]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function updateSounds()
    {
        try {
            $user = Auth::user();
            $validated = request()->validate([
                'phaser_scene_sound_volume' => 'required|integer|min:0|max:100',
                'phaser_scene_sound_muted' => 'required|boolean',
            ]);

            $user->phaser_scene_sound_volume = $validated['phaser_scene_sound_volume'];
            $user->phaser_scene_sound_muted = $validated['phaser_scene_sound_muted'];
            $user->save();
            return $this->successResponse([]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
