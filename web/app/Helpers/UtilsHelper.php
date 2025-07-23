<?php

namespace App\Helpers;

use App\Models\Page;
use App\Models\PresetEmail;
use App\Models\Rgpd;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;
use Exception;
use stdClass;

class UtilsHelper
{
    public static function dateNow()
    {
        return Carbon::now('Europe/Madrid')->format('Y-m-d H:i:s');
    }

    public static function checkParam($param)
    {
        return (!is_null($param) && $param != "") ? $param : null;
    }

    public static function isJson($string): bool
    {
        json_decode($string);
        return (bool)json_last_error() == JSON_ERROR_NONE;
    }

    public static function getExtensionByMimetype($mime)
    {
        if (in_array($mime, ['image/jpeg', 'image/jpg', 'image/png'], true)) {
            return '.webp';
        } elseif (in_array($mime, ['image/gif'], true)) {
            return '.gif';
        } elseif (in_array($mime, ['image/svg+xml'], true)) {
            return '.svg';
        }
        $parts = explode('/', $mime, 2);
        $subtypeRaw = $parts[1] ?? '';
        $subtype = explode(';', $subtypeRaw, 2)[0];
        return '.' . ltrim($subtype, '.');
    }

    public static function getClassName($object)
    {
        $path = explode('\\', get_class($object));
        return array_pop($path);
    }

    public static function getTimeElapsed()
    {
        return sprintf("%.2f", microtime(true) - LARAVEL_START);
    }

    public static function getPosixTimeSince($time = null)
    {
        $carbon = Carbon::now();
        switch ($time) {
            case 'hour':
            case 'hourly':
                $date = $carbon->subHour()->format('Y-m-d H:00:00');
                break;
            case 'day':
            case 'daily':
                $date = $carbon->today();
                break;
            case 'yesterday':
                $date = $carbon->yesterday();
                break;
            case 'week':
            case 'weekly':
                $date = $carbon->today()->subWeek();
                break;
            case 'month':
            case 'monthly':
                $date = $carbon->subMonth();
                break;
            case 'year':
            case 'yearly':
                $date = $carbon->subYear();
                break;
            default:
                $date = $carbon->createFromTimestamp(1);
                break;
        }
        return $date->timestamp;
    }

    public static function generateRandomToken()
    {
        return md5(rand(1, 10) . microtime());
    }

    public static function formatBytes($size, $precision = 2)
    {
        if ($size > 0) {
            $size = (int)$size;
            $base = log($size) / log(1024);
            $suffixes = array(' bytes', ' KB', ' MB', ' GB', ' TB');

            return round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];
        } else {
            return $size;
        }
    }

    public static function saveFile($file, $path, $filename, $disk): void
    {
        $file->storeAs($path, $filename, $disk);
    }

    public static function checkExistsDirectoryOrCreate($path): bool
    {
        if (!file_exists($path)) {
            return mkdir($path, 0755, true);
        }
        return true;
    }

    public static function ifDirectoryEmptyDelete($path)
    {
        $return = false;
        if ($path != "" && File::exists($path)) {
            $dir = scandir($path);
            if (($key = array_search(".", $dir)) !== false) {
                unset($dir[$key]);
            }
            if (($key = array_search("..", $dir)) !== false) {
                unset($dir[$key]);
            }
            if (!count($dir)) {
                rmdir($path);
                $return = true;
            }
        }
        return $return;
    }

    public static function executeLaravelPint($path = "")
    {
        return executeShellCommand('./vendor/bin/pint ' . $path);
    }

    public static function executeShellCommand($command)
    {
        return shell_exec($command . ' 2>&1');
    }

    public static function getEmailsToSendForm($form)
    {
        $forms = ['all', $form];
        $presetEmails = PresetEmail::select('id', 'email', 'form', 'language_communication')->whereIn('form', $forms)->active()->distinct()->get();

        $emails = $presetEmails->map(function ($item) {
            return [
                'email' => $item->email,
                'lang' => $item->language_communication,
            ];
        })->toArray();

        if ($emails) {
            return $emails;
        }

        $envTo = env('MAIL_TO_ADDRESS', null);
        return [
            [
                'email' => $envTo ?? 'francesc.romera@basetis.com',
                'lang' => config('app.locale'),
            ]
        ];
    }

    public static function getRouteBySlug($slug, $locale = null)
    {
        $returnSlug = "";
        $return = true;
        $locale = $locale ?? LaravelLocalization::getCurrentLocale();
        if ($slug == "home") {
            $returnSlug = "";
        } else {
            $page = Page::findSlug($slug);
            if (!is_null($page) && !($page instanceof Builder)) {
                $returnSlug = $page->getTranslation('slug', $locale);
                if (!is_null($page->parent_id)) {
                    $pageParent = Page::find($page->parent_id);
                    if (!is_null($pageParent)) {
                        $parentSlug = $pageParent->getTranslation('slug', $locale);
                        $returnSlug = $parentSlug . '/' . $returnSlug;
                    }
                }
            } else {
                $return = false;
            }
        }

        if ($return) {
            $return = LaravelLocalization::localizeUrl(($returnSlug == 'home' ? url('') : url($returnSlug)), $locale);
        }
        return $return;
    }

    public static function getTitleInLocale($pageSlug, $locale)
    {
        $return = null;
        $page = Page::findBySlug($pageSlug);
        if (!is_null($page) && !($page instanceof Builder)) {
            $return = $page->getTranslation('title', $locale);
        }
        return $return;
    }

    public static function checkRgpd($consent, $email, $name = null, $phone = null)
    {
        $rgpd = Rgpd::firstOrCreate(['email' => $email, 'phone' => $phone]);

        $rgpd->update([
            'name' => $name,
            'ip_consent' => (isset($_SERVER['HTTP_X_REAL_IP'])) ? $_SERVER['HTTP_X_REAL_IP'] : $_SERVER['REMOTE_ADDR'],
            'consent' => $consent,
            'datetime_consent' => Carbon::now('Europe/Madrid'),
            'active' => 1
        ]);
        return true;
    }

    public static function uploadFormFile($request, $disk)
    {
        try {
            $file = $request->file('image');
            $fileOriginalName = $request->file('image')->getClientOriginalName();
            $filename = Str::slug(pathinfo($fileOriginalName, PATHINFO_FILENAME));
            $extension = pathinfo($fileOriginalName, PATHINFO_EXTENSION);
            $fileFullName = $filename . '-' . Str::random(10) . '.' . $extension;
            saveFile($file, '', $fileFullName, $disk);
            return Storage::disk($disk)->url($fileFullName);
        } catch (Exception $e) {
            return null;
        }
    }

    public static function getRgbRandomColor()
    {
        return 'rgb(' . rand(0, 255) . ', ' . rand(0, 255) . ', ' . rand(0, 255) . ')';
    }

    public static function formatTelephone($number)
    {
        return wordwrap($number, 3, " ", 1);
    }

    public static function strSlug($string)
    {
        return Str::slug($string);
    }

    public static function convertRecursiveArrayToCollection($array)
    {
        $obj = new stdClass();

        foreach ($array as $k => $v) {
            if (strlen($k)) {
                if (is_array($v)) {
                    $obj->{$k} = convertRecursiveArrayToCollection($v);
                } else {
                    $obj->{$k} = $v;
                }
            }
        }

        return $obj;
    }

    public static function getIp()
    {
        return (isset($_SERVER['HTTP_X_REAL_IP'])) ? $_SERVER['HTTP_X_REAL_IP'] : $_SERVER['REMOTE_ADDR'];
    }

    public static function recaptchaValidation($recaptchaResponse = '')
    {
        if (!App::environment(['production', 'staging'])) {
            return true;
        }

        $recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';
        $recaptchaSecret = config('recaptcha.secret');
        $recaptcha = file_get_contents($recaptchaUrl . '?secret=' . $recaptchaSecret . '&response=' . $recaptchaResponse);
        $recaptcha = json_decode($recaptcha);

        if ($recaptcha->success == true && $recaptcha->score >= 0.7) {
            return true;
        }
        return false;
    }

    public static function setPHPIni(): void
    {
        ini_set('memory_limit', env('INI_MEMORY_LIMIT', '3584M'));
        ini_set('post_max_size', env('INI_POST_MAX_SIZE', '512M'));
        ini_set('upload_max_filesize', env('INI_UPLOAD_MAX_FILESIZE', '64M'));
        ini_set('max_input_time', env('INI_MAX_INPUT_TIME', '1200'));
        ini_set('max_execution_time', env('INI_MAX_EXCECUTION_TIME', '2400'));
        ini_set('display_errors', env('INI_DISPLAY_ERRORS', 1));
        ini_set('display_startup_errors', env('INI_DISPLAY_STARTUP_ERRORS', 1));
        error_reporting(E_ALL);
    }

    public static function setApiLocale($locale)
    {
        if (!is_null($locale) && in_array($locale, LaravelLocalization::getSupportedLanguagesKeys())) {
            LaravelLocalization::setLocale($locale);
        }
        return LaravelLocalization::getCurrentLocale();
    }

    public static function formatDate($date, $format)
    {
        return !is_null($date) ? Carbon::parse($date)->format($format) : null;
    }

    public static function formatPrice($value, $format = '€'): string
    {
        return (number_format($value, 2, ',', '.') ?? '-') . ' ' . $format;
    }

    public static function removeFile(string $path, string $disk = "uploads"): void
    {
        if (!is_null($path) && Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
        ifDirectoryEmptyDelete(getPathFromFile($path));
    }

    public static function getPathFromFile(string $path): string
    {
        $path = explode('/', $path);
        array_pop($path);
        return implode('/', $path);
    }
}
