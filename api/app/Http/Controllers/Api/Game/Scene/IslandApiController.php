<?php

namespace App\Http\Controllers\Api\Game\Scene;

use App\Http\Controllers\Controller;
use App\Http\Resources\IslandResource;
use App\Models\Island;
use App\Http\Controllers\Api\Traits\ResponseApiControllerTrait;
use App\Http\Controllers\Api\Game\Scene\Interfaces\IslandApiControllerInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class IslandApiController extends Controller implements IslandApiControllerInterface
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

    public function getMyIslands()
    {
        $user = Auth::user();
        $islands = Island::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
        return $this->successResponse([
            'islands' => IslandResource::collection($islands)
        ]);
    }

    public function join(Request $request)
    {
        $validated = $request->validate([
            'islandId' => 'required|integer|exists:islands,id',
        ]);

        $island = Island::find($validated['islandId']);
        if (!$island) {
            return $this->errorResponse('Island not found', 404);
        }
        $island->load('privateScenes'); // Load user relationship for the island

        return $this->successResponse([
            'island' => (new IslandResource($island))->toDTO()
        ]);
    }
}