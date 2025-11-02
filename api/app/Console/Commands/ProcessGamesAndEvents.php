<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Models\Minigame;
use App\Models\MinigameWeek;
use App\Models\MinigameScore;
use App\Models\Event;
use App\Models\EventScore;
use App\Models\Reward;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use App\Models\UserCatalogItem;

class ProcessGamesAndEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'boombang:process-games-events';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Procesa minijuegos y eventos: crea semanas, reparte premios a la finalización';

    public function handle()
    {
        $now = Carbon::now();

        DB::beginTransaction();
        try {
            // 1) Asegurarse de que existe la semana actual para cada minigame
            // Esto se ejecuta siempre, no solo los lunes, para asegurar que se cree la semana si no existe
            $this->createWeeklyForMinigames($now);

            // 2) Entregar premios de MinigameWeek que han terminado y no hayan sido procesados
            $this->processMinigameWeeks($now);

            // 3) Entregar premios de Events que han terminado y no hayan sido procesados
            $this->processEvents($now);

            DB::commit();
            $this->info('ProcessGamesAndEvents completed successfully.');
            return 0;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Error in ProcessGamesAndEvents: '.$e->getMessage());
            // Optionally log
            if (function_exists('logger')) {
                logger()->error('ProcessGamesAndEvents error: '.$e->getMessage(), ['exception' => $e]);
            }
            return 1;
        }
    }

    protected function createWeeklyForMinigames(Carbon $now)
    {
        // Calculate week start (Monday 00:00) and end (next Monday 00:00)
        $start = $now->copy()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $end = $start->copy()->addDays(7)->startOfDay();

        $weekNumber = $start->isoWeek();
        $year = $start->year;

        $this->info("Creating missing MinigameWeek records for week {$weekNumber}/{$year}");

        $minigames = Minigame::all();
        foreach ($minigames as $minigame) {
            $exists = MinigameWeek::where('minigame_id', $minigame->id)
                ->where('week_number', $weekNumber)
                ->where('year', $year)
                ->exists();

            if (! $exists) {
                MinigameWeek::create([
                    'minigame_id' => $minigame->id,
                    'week_number' => $weekNumber,
                    'year' => $year,
                    'start_date' => $start,
                    'end_date' => $end,
                ]);
                $this->info("Created MinigameWeek for minigame {$minigame->id}");
            }
        }
    }

    protected function processMinigameWeeks(Carbon $now)
    {
        // Find weeks that have end_date < now and that have not been processed yet.
        // We assume minigame_weeks table has timestamps; we'll use a processed flag in cache or a DB column.
        // To avoid schema changes, we'll track processed weeks in a simple pivot table idea is complex;
        // Instead, we will check if rewards were already given by looking for scores with processed marker: since no marker,
        // we'll rely on a simple approach: once end_date < now, distribute rewards for that week if there are rewards configured

            $weeks = MinigameWeek::where('end_date', '<=', $now)->get();

        foreach ($weeks as $week) {
            // Verificar si ya se procesó usando la base de datos
            $cacheKey = "minigame_week_processed_{$week->id}";
            if (Cache::has($cacheKey)) {
                continue;
            }
            
            // Verificar si ya existen premios otorgados para esta semana
            $existingRewards = UserCatalogItem::where('created_at', '>=', $week->end_date)
                ->whereHas('catalogItem.rewards', function($query) use ($week) {
                    $query->where('minigame_id', $week->minigame_id);
                })
                ->exists();
                
            if ($existingRewards) {
                Cache::put($cacheKey, true, 60*60*24*7);
                continue;
            }

            $this->info("Processing MinigameWeek id={$week->id} minigame_id={$week->minigame_id}");

            // Get scores grouped by user, highest score per user
            $scores = MinigameScore::where('minigame_week_id', $week->id)
                ->select('user_id', DB::raw('MAX(score) as score'))
                ->groupBy('user_id')
                ->orderByDesc('score')
                ->get();

            if ($scores->isEmpty()) {
                // mark as processed briefly and skip
                Cache::put($cacheKey, true, 60*60*24); // 24h
                continue;
            }

            // Get rewards configured for this minigame (rank ranges)
            $rewards = Reward::where('minigame_id', $week->minigame_id)
                ->orderBy('rank_from')
                ->get();

            if ($rewards->isEmpty()) {
                Cache::put($cacheKey, true, 60*60*24);
                continue;
            }

            // Iterate over scores and assign rewards based on rank
            $rank = 1;
            foreach ($scores as $score) {
                $rewardGiven = false;
                foreach ($rewards as $reward) {
                    if ($rank >= $reward->rank_from && $rank <= $reward->rank_to && !$rewardGiven) {
                        $this->giveRewardToUser($score->user_id, $reward, $week->minigame_id, 'minigame_week', $week->id);
                        $rewardGiven = true; // Evita múltiples premios por rango superpuesto
                        break;
                    }
                }
                $rank++;
            }

            // mark processed in cache for 7 days
            Cache::put($cacheKey, true, 60*60*24*7);
        }
    }

    protected function processEvents(Carbon $now)
    {
        $events = Event::where('end_date', '<=', $now)->get();

        foreach ($events as $event) {
            $cacheKey = "event_processed_{$event->id}";
            if (Cache::has($cacheKey)) {
                continue;
            }
            
            // Verificar si ya existen premios otorgados para este evento
            $existingRewards = UserCatalogItem::where('created_at', '>=', $event->end_date)
                ->whereHas('catalogItem.rewards', function($query) use ($event) {
                    $query->where('event_id', $event->id);
                })
                ->exists();
                
            if ($existingRewards) {
                Cache::put($cacheKey, true, 60*60*24*7);
                continue;
            }

            $this->info("Processing Event id={$event->id} ({$event->name})");

            $scores = EventScore::where('event_id', $event->id)
                ->select('user_id', DB::raw('MAX(score) as score'))
                ->groupBy('user_id')
                ->orderByDesc('score')
                ->get();

            if ($scores->isEmpty()) {
                Cache::put($cacheKey, true, 60*60*24);
                continue;
            }

            $rewards = Reward::where('event_id', $event->id)
                ->orderBy('rank_from')
                ->get();

            if ($rewards->isEmpty()) {
                Cache::put($cacheKey, true, 60*60*24);
                continue;
            }

            $rank = 1;
            foreach ($scores as $score) {
                $rewardGiven = false;
                foreach ($rewards as $reward) {
                    if ($rank >= $reward->rank_from && $rank <= $reward->rank_to && !$rewardGiven) {
                        $this->giveRewardToUser($score->user_id, $reward, null, 'event', $event->id);
                        $rewardGiven = true; // Evita múltiples premios por rango superpuesto
                        break;
                    }
                }
                $rank++;
            }

            Cache::put($cacheKey, true, 60*60*24*7);
        }
    }

    protected function giveRewardToUser($userId, Reward $reward, $minigameId = null, $type = 'minigame_week', $sourceId = null)
    {
        // This is a placeholder for the real logic to grant an item to a user.
        // Depending on the project, there might be Services or Jobs to add items to inventory.
        // We'll try to use a CatalogItem relationship if present or fire an event.

        $this->info("Granting reward catalog_item_id={$reward->catalog_item_id} qty={$reward->quantity} to user {$userId} (type={$type} source={$sourceId})");

        // Create a UserCatalogItem record. Adjust fields as needed by your app logic.
        try {
            if (class_exists(UserCatalogItem::class)) {
                $data = [
                    'user_id' => $userId,
                    'catalog_item_id' => $reward->catalog_item_id,
                    // sensible defaults; adjust if your items need other fields
                    'private_scene_id' => null,
                    'occupied_tiles' => json_encode([]), // Convertir a JSON
                    'show_in_inventory' => true,
                    'expires_at' => null,
                    'rotated' => false,
                    'resize_enabled' => false,
                    'resized' => false,
                ];

                // If quantity > 1, create multiple records (or adjust logic to increment stack)
                $qty = max(1, (int) $reward->quantity);
                for ($i = 0; $i < $qty; $i++) {
                    UserCatalogItem::create($data);
                }
            }
        } catch (\Throwable $e) {
            if (function_exists('logger')) {
                logger()->error('Failed to grant UserCatalogItem reward: '.$e->getMessage(), ['reward' => $reward, 'user' => $userId]);
            }
        }
    }
}
