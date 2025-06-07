<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;

class IncreaseStatsApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function index(Request $request): JsonResource
    {
        try {
            switch ($request->stats_type) {
                case 'uppercuts_sent':
                    User::find($request->user_id)->update(['uppercuts_sent' => DB::raw('uppercuts_sent + 1')]);
                    break;
                case 'uppercuts_received':
                    User::find($request->user_id)->update(['uppercuts_received' => DB::raw('uppercuts_received + 1')]);
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
