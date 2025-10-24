<?php

namespace App\Http\Controllers\Api\Game;

use Exception;
use App\Models\Minigame;
use App\Models\MinigameWeek;
use App\Models\MinigameScore;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Http\Controllers\Api\Game\Interfaces\MinigameApiControllerInterface;

class MinigameApiController extends Controller implements MinigameApiControllerInterface
{
    use ResponseApiControllerTrait;

    /**
     * Get all minigames with their weeks
     *
     * @return JsonResource
     */
    public function index(): JsonResource
    {
        try {
            $minigames = Minigame::with(['weeks' => function ($query) {
                $query->orderBy('year', 'desc')
                      ->orderBy('week_number', 'desc');
            }])->get();

            $formattedMinigames = $minigames->map(function ($minigame) {
                return [
                    'id' => $minigame->id,
                    'name' => $minigame->name,
                    'description' => $minigame->description,
                    'weeks' => $minigame->weeks->map(function ($week) {
                        return [
                            'id' => $week->id,
                            'week_number' => $week->week_number,
                            'year' => $week->year,
                            'start_date' => $week->start_date,
                            'end_date' => $week->end_date,
                            'week_identifier' => "W{$week->week_number}-{$week->year}" // Identificador único para la semana
                        ];
                    })
                ];
            });

            return $this->successResponse([
                'minigames' => $formattedMinigames
            ]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Get ranking for a specific minigame and week with pagination
     *
     * @param Request $request
     * @return JsonResource
     */
    public function getRanking(Request $request): JsonResource
    {
        try {
            $request->validate([
                'minigame_id' => 'required|integer|exists:minigames,id',
                'week_id' => 'required|integer|exists:minigame_weeks,id',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            $minigameId = $request->input('minigame_id');
            $weekId = $request->input('week_id');
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 20);

            // Verificar que la semana pertenece al minijuego
            $week = MinigameWeek::where('id', $weekId)
                               ->where('minigame_id', $minigameId)
                               ->first();

            if (!$week) {
                throw new Exception('La semana especificada no pertenece al minijuego seleccionado');
            }

            // Obtener el ranking con paginación
            $scores = MinigameScore::with(['user', 'minigame'])
                ->where('minigame_id', $minigameId)
                ->where('minigame_week_id', $weekId)
                ->orderBy('score', 'desc')
                ->orderBy('created_at', 'asc') // En caso de empate, gana quien lo hizo primero
                ->paginate($perPage, ['*'], 'page', $page);

            // Formatear los datos del ranking
            $ranking = $scores->getCollection()->map(function ($score, $index) use ($page, $perPage) {
                $position = (($page - 1) * $perPage) + $index + 1;
                return [
                    'position' => $position,
                    'user_id' => $score->user_id,
                    'username' => $score->user->username ?? 'Usuario Desconocido',
                    'score' => $score->score,
                    'created_at' => $score->created_at
                ];
            });

            return $this->successResponse([
                'ranking' => $ranking,
                'pagination' => [
                    'current_page' => $scores->currentPage(),
                    'last_page' => $scores->lastPage(),
                    'per_page' => $scores->perPage(),
                    'total' => $scores->total(),
                    'from' => $scores->firstItem(),
                    'to' => $scores->lastItem()
                ],
                'minigame' => [
                    'id' => $week->minigame->id,
                    'name' => $week->minigame->name,
                    'description' => $week->minigame->description
                ],
                'week' => [
                    'id' => $week->id,
                    'week_number' => $week->week_number,
                    'year' => $week->year,
                    'start_date' => $week->start_date,
                    'end_date' => $week->end_date,
                    'week_identifier' => "W{$week->week_number}-{$week->year}"
                ]
            ]);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}