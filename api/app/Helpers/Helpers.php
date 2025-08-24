<?php

use App\Helpers\AuthHelper;
use App\Helpers\ImageHelper;
use App\Helpers\UtilsHelper;

/**
 * PageHelper
 */

if (!function_exists('isBackpackAdmin')) {
    function isBackpackAdmin($user = null)
    {
        return AuthHelper::isBackpackAdmin($user);
    }
}


/**
 * UtilsHelper
 */

if (!function_exists('saveFile')) {
    function saveFile($file, $path, $filename, $disk): void
    {
        UtilsHelper::saveFile($file, $path, $filename, $disk);
    }
}

if (!function_exists('getRouteBySlug')) {
    function getRouteBySlug($slug, $locale = null)
    {
        return UtilsHelper::getRouteBySlug($slug, $locale);
    }
}

if (!function_exists('getTitleInLocale')) {
    function getTitleInLocale($pageSlug, $locale)
    {
        return UtilsHelper::getTitleInLocale($pageSlug, $locale);
    }
}

if (!function_exists('dateNow')) {
    function dateNow()
    {
        return UtilsHelper::dateNow();
    }
}

if (!function_exists('checkParam')) {
    function checkParam($param)
    {
        return UtilsHelper::checkParam($param);
    }
}

if (!function_exists('isJson')) {
    function isJson($json)
    {
        return UtilsHelper::isJson($json);
    }
}

if (!function_exists('checkRgpd')) {
    function checkRgpd($consent, $email, $name = null, $phone = null)
    {
        return UtilsHelper::checkRgpd($consent, $email, $name, $phone);
    }
}

if (!function_exists('getExtensionByMimetype')) {
    function getExtensionByMimetype($mime)
    {
        return UtilsHelper::getExtensionByMimetype($mime);
    }
}

if (!function_exists('getClassName')) {
    function getClassName($object)
    {
        return UtilsHelper::getClassName($object);
    }
}

if (!function_exists('getEmailsToSendForm')) {
    function getEmailsToSendForm($form)
    {
        return UtilsHelper::getEmailsToSendForm($form);
    }
}

if (!function_exists('getTimeElapsed')) {
    function getTimeElapsed()
    {
        return UtilsHelper::getTimeElapsed();
    }
}

if (!function_exists('getPosixTimeSince')) {
    function getPosixTimeSince($time = null)
    {
        return UtilsHelper::getPosixTimeSince($time);
    }
}

if (!function_exists('uploadFormFile')) {
    function uploadFormFile($request, $disk)
    {
        return UtilsHelper::uploadFormFile($request, $disk);
    }
}

if (!function_exists('getRgbRandomColor')) {
    function getRgbRandomColor()
    {
        return UtilsHelper::getRgbRandomColor();
    }
}

if (!function_exists('generateRandomToken')) {
    function generateRandomToken()
    {
        return UtilsHelper::generateRandomToken();
    }
}

if (!function_exists('formatBytes')) {
    function formatBytes($size, $precision = 2)
    {
        return UtilsHelper::formatBytes($size, $precision);
    }
}

if (!function_exists('checkExistsDirectoryOrCreate')) {
    function checkExistsDirectoryOrCreate($path)
    {
        return UtilsHelper::checkExistsDirectoryOrCreate($path);
    }
}

if (!function_exists('ifDirectoryEmptyDelete')) {
    function ifDirectoryEmptyDelete($path)
    {
        return UtilsHelper::ifDirectoryEmptyDelete($path);
    }
}

if (!function_exists('executeLaravelPint')) {
    function executeLaravelPint($path)
    {
        return UtilsHelper::executeLaravelPint($path);
    }
}

if (!function_exists('executeShellCommand')) {
    function executeShellCommand($command)
    {
        return UtilsHelper::executeShellCommand($command);
    }
}

if (!function_exists('formatTelephone')) {
    function formatTelephone($number)
    {
        return UtilsHelper::formatTelephone($number);
    }
}

if (!function_exists('strSlug')) {
    function strSlug($string)
    {
        return UtilsHelper::strSlug($string);
    }
}

if (!function_exists('convertRecursiveArrayToCollection')) {
    function convertRecursiveArrayToCollection($array)
    {
        return UtilsHelper::convertRecursiveArrayToCollection($array);
    }
}

if (!function_exists('getIp')) {
    function getIp()
    {
        return UtilsHelper::getIp();
    }
}

if (!function_exists('recaptchaValidation')) {
    function recaptchaValidation($recaptchaResponse)
    {
        return UtilsHelper::recaptchaValidation($recaptchaResponse);
    }
}

if (!function_exists('setPHPIni')) {
    function setPHPIni(): void
    {
        UtilsHelper::setPHPIni();
    }
}

if (!function_exists('setApiLocale')) {
    function setApiLocale($locale)
    {
        return UtilsHelper::setApiLocale($locale);
    }
}

if (!function_exists('formatDate')) {
    function formatDate($date, $format = 'd-m-Y')
    {
        return UtilsHelper::formatDate($date, $format);
    }
}

if (!function_exists('formatPrice')) {
    function formatPrice($value, $format = '€')
    {
        return UtilsHelper::formatPrice($value, $format);
    }
}

if (!function_exists('removeFile')) {
    function removeFile(string $path, string $disk = "uploads"): void
    {
        UtilsHelper::removeFile($path, $disk);
    }
}

if (!function_exists('getPathFromFile')) {
    function getPathFromFile(string $path)
    {
        return UtilsHelper::getPathFromFile(path: $path);
    }
}

/**
 * ImageHelper
 */

if (!function_exists('generateMobileImage')) {
    function generateMobileImage($disk, $image, $filename, $destination_path)
    {
        return ImageHelper::generateMobileImage($disk, $image, $filename, $destination_path);
    }
}

if (!function_exists('generateThumbnailImage')) {
    function generateThumbnailImage($disk, $image, $filename, $destination_path)
    {
        return ImageHelper::generateThumbnailImage($disk, $image, $filename, $destination_path);
    }
}

if (!function_exists('addToNameImage')) {
    function addToNameImage($filename, $addToFileName, $extension)
    {
        return ImageHelper::addToNameImage($filename, $addToFileName, $extension);
    }
}

if (!function_exists('saveImage')) {
    function saveImage($disk, $path, $image, $quality = null)
    {
        return ImageHelper::saveImage($disk, $path, $image, $quality);
    }
}

if (!function_exists('resizeImage')) {
    function resizeImage($image, $maxWidth = null, $maxHeigth = null)
    {
        return ImageHelper::resizeImage($image, $maxWidth, $maxHeigth);
    }
}

if (!function_exists('genericImageMutator')) {
    function genericImageMutator($entity, $value, $destination, $filename, $attribute = "image", $acceptSvg = true, $disk = "uploads", $maxWidthSize = null, $maxHeightSize = null)
    {
        return ImageHelper::genericImageMutator(entity: $entity, value: $value, destination: $destination, filename: $filename, attribute: $attribute, acceptSvg: $acceptSvg, disk: $disk, maxWidthSize: $maxWidthSize, maxHeightSize: $maxHeightSize);
    }
}

if (!function_exists('injectSvg')) {
    function injectSvg(string $path, string $alt = null, string $title = null): string
    {
        return ImageHelper::injectSvg(path: $path, alt: $alt, title: $title);
    }
}

if (!function_exists('injectPictureTag')) {
    function injectPictureTag(string $imageDefault, array $images, string|null $id = null, string|null $class = null, string $alt = '', string $title = '', bool $lazy = true): string
    {
        return ImageHelper::injectPictureTag(imageDefault: $imageDefault, images: $images, id: $id, class: $class, alt: $alt, title: $title, lazy: $lazy);
    }
}

