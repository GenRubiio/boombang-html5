<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use Illuminate\Support\Facades\Auth;

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
                case 'rings_won':
                    $user->update(['rings_won' => DB::raw('rings_won + 1')]);
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
