<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class PassportInstallCustomCommand extends Command
{
    protected $signature = 'passport:install';

    protected $description = 'Instala Passport sin volver a publicar migraciones.';

    public function handle()
    {
        $this->info('Instalando claves y clientes de Passport sin publicar migraciones...');

        // Generar las claves (forzando sobrescritura si ya existen)
        $this->call('passport:keys', [
            '--force' => true,
            '--no-interaction' => true,
        ]);

        // Crear cliente personal
        $this->call('passport:client', [
            '--personal' => true,
            '--name' => 'Personal Access Client',
            '--no-interaction' => true,
        ]);

        // Crear cliente password grant
        $this->call('passport:client', [
            '--password' => true,
            '--name' => 'Password Grant Client',
            '--redirect_uri' => config('app.url') . '/callback', // valor por defecto
            '--provider' => 'users', // evita que pregunte [users]/[backpack]
            '--no-interaction' => true,
        ]);
    }
}
