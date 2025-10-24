<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Minigame;
use App\Models\MinigameWeek;
use App\Models\MinigameScore;
use App\Models\User;
use Carbon\Carbon;

class MinigameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear minijuegos de ejemplo
        $minigames = [
            [
                'name' => 'Snake Game',
                'description' => 'Juego clásico de la serpiente donde debes comer la comida para crecer sin chocarte contigo mismo.'
            ],
            [
                'name' => 'Tetris',
                'description' => 'Juego de bloques donde debes completar líneas horizontales para obtener puntos.'
            ],
            [
                'name' => 'Memory Match',
                'description' => 'Juego de memoria donde debes encontrar las parejas de cartas idénticas.'
            ],
            [
                'name' => 'Puzzle Slider',
                'description' => 'Juego de rompecabezas deslizante donde debes ordenar los números en secuencia.'
            ]
        ];

        foreach ($minigames as $minigameData) {
            $minigame = Minigame::create($minigameData);

            // Crear semanas para cada minijuego (últimas 4 semanas)
            for ($i = 3; $i >= 0; $i--) {
                $startDate = Carbon::now()->subWeeks($i)->startOfWeek();
                $endDate = $startDate->copy()->endOfWeek();
                
                $week = MinigameWeek::create([
                    'minigame_id' => $minigame->id,
                    'week_number' => $startDate->isoWeek(),
                    'year' => $startDate->year,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ]);

                // Crear scores aleatorios para cada semana
                $users = User::take(20)->get(); // Tomar los primeros 20 usuarios
                
                foreach ($users as $user) {
                    // No todos los usuarios tienen scores en todas las semanas
                    if (rand(1, 10) > 3) { // 70% de probabilidad
                        MinigameScore::create([
                            'user_id' => $user->id,
                            'minigame_week_id' => $week->id,
                            'minigame_id' => $minigame->id,
                            'score' => rand(100, 10000), // Score aleatorio entre 100 y 10000
                        ]);
                    }
                }
            }
        }
    }
}