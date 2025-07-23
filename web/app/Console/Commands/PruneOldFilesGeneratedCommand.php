<?php

namespace App\Console\Commands;

use App\Exceptions\GenericException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PruneOldFilesGeneratedCommand extends Command
{
    protected $signature = 'prune:old-files-generated';

    protected $description = 'Remove old files or backups from config data';

    public function handle(): void
    {
        $disksToPrune = config('prune-files-command.disks');
        foreach ($disksToPrune as $disk => $time) {
            $sincePosix = getPosixTimeSince($time);

            if (!$sincePosix || $sincePosix <= 1) {
                $errorMessage = "Prune old files generated error.
                \n\rTime: " . $time . "
                \n\rSince posix Date: " . $sincePosix;
                Log::channel('cron')->error($errorMessage);
                throw new GenericException($errorMessage);
            }

            $this->pruneFilesByDisk($sincePosix, $disk);
        }
    }

    private function pruneFilesByDisk($sincePosix, $disk): void
    {
        $files = collect(Storage::disk($disk)->allFiles())
            ->reject(function ($file) {
                return basename($file) === '.gitignore';
            })->all();

        $filesToDelete = collect($files)->filter(function ($file) use ($sincePosix, $disk) {
            return Storage::disk($disk)->lastModified($file) < $sincePosix;
        });

        Log::channel('cron')->info('Se eliminan ' . count($filesToDelete) . ' archivos del disco ' . $disk);
        Storage::disk($disk)->delete($filesToDelete->all());
    }
}
