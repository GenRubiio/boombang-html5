<?php

namespace App\Http\Controllers\Api\Game\Scene;

use App\Http\Controllers\Controller;
use App\Http\Resources\IslandResource;
use App\Models\Island;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class IslandApiController extends Controller
{
    use ResponseApiControllerTrait;

    public function index()
    {
        $islands = Island::all();
        return $this->successResponse([
            'islands' => IslandResource::collection($islands)
        ]);
    }

    public function create(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:islands,name',
            'type' => 'required|integer|in:1,2,3,4,5', // Assuming types are integers 1-5
        ]);

        $island = Island::create([
            'name' => $validated['name'],
            'is_uppercut_active' => true, // Default value
            'type' => $validated['type'],
            'user_id' => $user->id,
        ]);

        return $this->successResponse([
            'island' => (new IslandResource($island))->toDTO()
        ]);
    }
}