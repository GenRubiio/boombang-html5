<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Minigame;
use App\Models\MinigameWeek;
use Illuminate\Http\Request;
use App\Models\MinigameScore;
use App\Enums\MinigameTypeEnum;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class IncreaseStatsApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function index(Request $request): JsonResource
    {
        try {
            $user = Auth::user();
            switch ($request->stats_type) {
                case 'uppercuts_sent':
                    $user->update(['uppercuts_sent' => DB::raw('uppercuts_sent + 1')]);
                    break;
                case 'uppercuts_received':
                    $user->update(['uppercuts_received' => DB::raw('uppercuts_received + 1')]);
                    break;
                case 'coconuts_sent':
                    $user->update(['coconuts_sent' => DB::raw('coconuts_sent + 1')]);
                    break;
                case 'coconuts_received':
                    $user->update(['coconuts_received' => DB::raw('coconuts_received + 1')]);
                    break;
                case 'kisses_sent':
                    $user->update(['kisses_sent' => DB::raw('kisses_sent + 1')]);
                    break;
                case 'kisses_received':
                    $user->update(['kisses_received' => DB::raw('kisses_received + 1')]);
                    break;
                case 'drinks_sent':
                    $user->update(['drinks_sent' => DB::raw('drinks_sent + 1')]);
                    break;
                case 'drinks_received':
                    $user->update(['drinks_received' => DB::raw('drinks_received + 1')]);
                    break;
                case 'roses_sent':
                    $user->update(['roses_sent' => DB::raw('roses_sent + 1')]);
                    break;
                case 'roses_received':
                    $user->update(['roses_received' => DB::raw('roses_received + 1')]);
                    break;
                case 'rings_won':
                    $user->update(['rings_won' => DB::raw('rings_won + 1')]);
                    // Buscar el minijuego Ring
                    $minigame = Minigame::where('type', MinigameTypeEnum::RING->key())->first();
                    if ($minigame) {
                        // Obtener la semana actual del minijuego
                        $currentWeek = MinigameWeek::where('minigame_id', $minigame->id)
                            ->where('start_date', '<=', now())
                            ->where('end_date', '>=', now())
                            ->first();

                        // Si no existe la semana actual, crearla
                        if (!$currentWeek) {
                            $now = now();
                            $start = $now->copy()->startOfWeek(Carbon::MONDAY)->startOfDay();
                            $end = $start->copy()->addDays(7)->startOfDay();
                            $weekNumber = $start->isoWeek();
                            $year = $start->year;

                            $currentWeek = MinigameWeek::create([
                                'minigame_id' => $minigame->id,
                                'week_number' => $weekNumber,
                                'year' => $year,
                                'start_date' => $start,
                                'end_date' => $end,
                            ]);
                        }

                        // Verificar si el usuario ya tiene un score para esta semana
                        $existingScore = MinigameScore::where('user_id', $user->id)
                            ->where('minigame_week_id', $currentWeek->id)
                            ->first();

                        if ($existingScore) {
                            // Actualizar el score sumando 1 punto
                            $existingScore->update(['score' => DB::raw('score + 1')]);
                        } else {
                            // Crear un nuevo registro con 1 punto
                            MinigameScore::create([
                                'user_id' => $user->id,
                                'minigame_week_id' => $currentWeek->id,
                                'minigame_id' => $minigame->id,
                                'score' => 1
                            ]);
                        }
                    }
                    break;
                default:
                    throw new Exception('Invalid stats type provided', 400);
            }
            return $this->successResponse();
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
