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
            'type' => 'required|integer|exists:islands_config,id',
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
        $island->load(['privateScenes', 'islandConfig']); // Load privateScenes and islandConfig relationships

        return $this->successResponse([
            'island' => (new IslandResource($island))->toDTO()
        ]);
    }

    public function updateName(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'islandId' => 'required|integer|exists:islands,id',
            'name' => 'required|string|max:50',
        ]);

        $island = Island::find($validated['islandId']);
        
        if (!$island) {
            return $this->errorResponse('Island not found', 404);
        }

        // Verificar que el usuario es el propietario de la isla
        if ($island->user_id !== $user->id) {
            return $this->errorResponse('You are not the owner of this island', 403);
        }

        $trimmedName = trim($validated['name']);
        
        // Si el nombre no cambió, no hacer nada
        if ($trimmedName === $island->name) {
            return $this->successResponse([
                'island' => (new IslandResource($island))->toDTO(),
                'message' => 'Island name unchanged'
            ]);
        }

        // Verificar que el nombre no esté en uso por otra isla
        $existingIsland = Island::where('name', $trimmedName)
                                ->where('id', '!=', $island->id)
                                ->first();
        
        if ($existingIsland) {
            return $this->errorResponse('An island with this name already exists', 422);
        }

        // Actualizar el nombre
        $island->name = $trimmedName;
        $island->save();

        return $this->successResponse([
            'island' => (new IslandResource($island))->toDTO(),
            'message' => 'Island name updated successfully'
        ]);
    }

    public function updateDescription(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'islandId' => 'required|integer|exists:islands,id',
            'description' => 'nullable|string|max:500',
        ]);

        $island = Island::find($validated['islandId']);
        
        if (!$island) {
            return $this->errorResponse('Island not found', 404);
        }

        // Verificar que el usuario es el propietario de la isla
        if ($island->user_id !== $user->id) {
            return $this->errorResponse('You are not the owner of this island', 403);
        }

        $trimmedDescription = $validated['description'] ? trim($validated['description']) : '';
        
        // Si la descripción no cambió, no hacer nada
        if ($trimmedDescription === ($island->description ?? '')) {
            return $this->successResponse([
                'island' => (new IslandResource($island))->toDTO(),
                'message' => 'Island description unchanged'
            ]);
        }

        // Actualizar la descripción
        $island->description = $trimmedDescription ?: null;
        $island->save();

        return $this->successResponse([
            'island' => (new IslandResource($island))->toDTO(),
            'message' => 'Island description updated successfully'
        ]);
    }

    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|max:255',
        ]);

        $query = trim($validated['query']);

        // Buscar islas cuyo nombre contenga el texto de búsqueda
        // Los visitantes se calculan en el servidor, no en la base de datos
        $islands = Island::where('name', 'LIKE', "%{$query}%")
                         ->orderBy('created_at', 'desc')
                         ->limit(20)
                         ->get();

        return $this->successResponse([
            'islands' => IslandResource::collection($islands)
        ]);
    }
}