<?php

namespace App\Console\Commands;

use App\Jobs\RestartServerJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RestartServerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'server:restart';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reinicia el servidor Docker a través de un job en cola';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Despachando job para reiniciar el servidor...');
        
        try {
            // Despachar el job a la cola
            RestartServerJob::dispatch();
            
            $this->info('Job despachado exitosamente. El servidor se reiniciará en breve.');
            Log::info('Comando server:restart ejecutado. Job despachado a la cola.');
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('Error al despachar el job: ' . $e->getMessage());
            Log::error('Error en comando server:restart: ' . $e->getMessage());
            
            return Command::FAILURE;
        }
    }
}