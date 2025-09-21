<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\RestartServerJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ServerManagementController extends Controller
{
    /**
     * Despatchea el job para reiniciar el servidor Docker
     */
    public function restartServer(Request $request)
    {
        try {
            // Despachar el job a la cola
            RestartServerJob::dispatch();
            
            Log::info('Job de reinicio de servidor despachado desde Backpack');
            
            // Redireccionar de vuelta con mensaje de éxito
            return redirect()->back()->with('success', 'Job de reinicio del servidor despachado exitosamente. El servidor se reiniciará en breve.');
            
        } catch (\Exception $e) {
            Log::error('Error al despachar job de reinicio desde Backpack: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Error al despachar el job de reinicio: ' . $e->getMessage());
        }
    }
    
    /**
     * Muestra la página de gestión del servidor
     */
    public function index()
    {
        return view('admin.server-management.index');
    }
}