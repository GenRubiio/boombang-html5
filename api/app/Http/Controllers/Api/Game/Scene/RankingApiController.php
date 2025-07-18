<?php

namespace App\Http\Controllers\Api\Game\Scene;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\RankingCategory;
use App\Models\VRankingSummary;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

use App\Http\Resources\RankingCategoryResource;
use App\Http\Resources\VRankingSummaryResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Http\Controllers\Api\Game\Scene\Interfaces\RankingApiControllerInterface;

class RankingApiController extends Controller implements RankingApiControllerInterface
{
    use ResponseApiControllerTrait;

    public function getCategories(): JsonResource
    {
        try {
            $categories = RankingCategory::active()->get();
            return $this->successResponse(
                [
                    'categories' => RankingCategoryResource::collection($categories)
                ]
            );
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    public function get(Request $request): JsonResource
    {
        try {
            $validate = $request->validate([
                'ranking_category_id' => 'required|integer|exists:ranking_categories,id',
                'year' => 'nullable|integer|date_format:Y',
                'season' => 'nullable|integer|min:1',
                'page' => 'integer|min:1',
            ]);

            $category = RankingCategory::findOrFail($validate['ranking_category_id']);
            $page = $validate['page'] ?? 1;
            $requestedSeason = $validate['season'] ?? null;
            $duration = $category->duration;
            $maxRecordsPerPage = 10;

            if ($duration <= 0) {
                return $this->errorResponse('La duración de la categoría de ranking no es válida.', 400);
            }

            $year = $validate['year'] ?? VRankingSummary::where('ranking_category_id', $category->id)->max('year') ?? date('Y');

            $min_week_info = VRankingSummary::where('ranking_category_id', $category->id)
                ->where('year', $year)
                ->selectRaw('MIN(week) as min_week')
                ->first();

            if (!$min_week_info || is_null($min_week_info->min_week)) {
                return $this->successResponse([
                    'rankings' => [],
                    'seasons' => [],
                    'pagination' => null
                ]);
            }
            $min_week = $min_week_info->min_week;

            $seasons = VRankingSummary::where('ranking_category_id', $category->id)
                ->where('year', $year)
                ->selectRaw('CEIL((week - ? + 1) / ?) as season', [$min_week, $duration])
                ->distinct()
                ->orderBy('season', 'desc')
                ->pluck('season');

            if ($seasons->isEmpty()) {
                return $this->successResponse([
                    'rankings' => [],
                    'seasons' => $seasons,
                    'pagination' => null
                ]);
            }

            $currentSeason = $requestedSeason ?? $seasons->first();

            $startWeek = $min_week + (($currentSeason - 1) * $duration);
            $endWeek = $startWeek + $duration - 1;

            $subquery = VRankingSummary::select('user_id', DB::raw('SUM(total_points) as total_points'))
                ->where('ranking_category_id', $category->id)
                ->where('year', $year)
                ->whereBetween('week', [$startWeek, $endWeek])
                ->groupBy('user_id');

            $query = User::joinSub($subquery, 'ranking_summary', function ($join) {
                    $join->on('users.id', '=', 'ranking_summary.user_id');
                })
                ->select('users.*', 'ranking_summary.total_points')
                ->orderBy('ranking_summary.total_points', 'desc');

            $rankings = $query->paginate($maxRecordsPerPage, ['*'], 'page', $page);

            $rankings->getCollection()->transform(function ($item) {
                return (object) [
                    'user' => $item,
                    'total_points' => $item->total_points,
                ];
            });

            return $this->successResponse(
                [
                    'rankings' => VRankingSummaryResource::collection($rankings),
                    'seasons' => $seasons,
                    'pagination' => [
                        'total' => $rankings->total(),
                        'per_page' => $rankings->perPage(),
                        'current_page' => $rankings->currentPage(),
                        'last_page' => $rankings->lastPage(),
                        'from' => $rankings->firstItem(),
                        'to' => $rankings->lastItem(),
                    ],
                ]
            );
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }
}
