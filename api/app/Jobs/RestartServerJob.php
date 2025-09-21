<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RestartServerJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Iniciando reinicio del servidor Docker...');
            
            // Ejecutar el comando para reiniciar el servidor Docker
            $command = 'sudo docker restart boombang-html5-server-1';
            $output = shell_exec($command . ' 2>&1');
            
            Log::info('Comando ejecutado: ' . $command);
            Log::info('Salida del comando: ' . $output);
            
            if ($output === null) {
                Log::error('Error al ejecutar el comando de reinicio del servidor');
            } else {
                Log::info('Servidor Docker reiniciado exitosamente');
            }
            
        } catch (\Exception $e) {
            Log::error('Error al reiniciar el servidor: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('El job de reinicio del servidor falló: ' . $exception->getMessage());
    }
}