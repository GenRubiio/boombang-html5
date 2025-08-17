<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use App\Models\User;
use App\Models\Ranking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Models\RankingCategory;

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
                case 'rings_won':
                    $user->update(['rings_won' => DB::raw('rings_won + 1')]);
                    Ranking::create([
                        'ranking_category_id' => RankingCategory::where('name', 'Ring')->first()->id,
                        'user_id' => $user->id,
                        'points' => 1
                    ]);
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
