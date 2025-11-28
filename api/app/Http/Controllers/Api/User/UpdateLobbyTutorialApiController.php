<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UpdateLobbyTutorialApiController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Validar los datos de entrada
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer|exists:users,id',
                'lobby_tutorial' => 'required|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Buscar el usuario
            $user = User::find($request->user_id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Actualizar el estado del tutorial
            $user->lobby_tutorial = $request->lobby_tutorial;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Lobby tutorial status updated successfully',
                'user' => [
                    'id' => $user->id,
                    'lobby_tutorial' => $user->lobby_tutorial
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Internal server error: ' . $e->getMessage()
            ], 500);
        }
    }
}