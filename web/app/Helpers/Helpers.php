<?php

use App\Helpers\VersionHelper;
use App\Helpers\AuthHelper;
use App\Helpers\CacheHelper;
use App\Helpers\CrudHelper;
use App\Helpers\ImageHelper;
use App\Helpers\MenuHelper;
use App\Helpers\SocialNetworksHelper;
use App\Helpers\PageHelper;
use App\Helpers\UtilsHelper;
use App\Helpers\MailHelper;

/**
 * PageHelper
 */

if (!function_exists('getBladePath')) {
    function getBladePath($page)
    {
        return PageHelper::getBladePath($page);
    }
}

if (!function_exists('getBladeTemplatePath')) {
    function getBladeTemplatePath($page)
    {
        return PageHelper::getBladeTemplatePath($page);
    }
}

if (!function_exists('getDirectoryBladePath')) {
    function getDirectoryBladePath($page)
    {
        return PageHelper::getDirectoryBladePath($page);
    }
}

if (!function_exists('getNofollowPage')) {
    function getNofollowPage($value)
    {
        return PageHelper::getNofollowPage($value);
    }
}

if (!function_exists('makeUrl')) {
    function makeUrl($pageName = 'Home', $slugFirstObject = null, $slugSecondObject = null)
    {
        return PageHelper::makeUrl($pageName, $slugFirstObject, $slugSecondObject);
    }
}

if (!function_exists('makeBreadcrumbs')) {
    function makeBreadcrumbs(
        $pageName = 'Home',
        $slugFirstObject = null,
        $nameFirstObject = "Object",
        $slugSecondObject = null,
        $nameSecondObject = "Object"
    ) {
        return PageHelper::makeBreadcrumbs(
            $pageName,
            $slugFirstObject,
            $nameFirstObject,
            $slugSecondObject,
            $nameSecondObject
        );
    }
}

if (!function_exists('translateUrl')) {
    function translateUrl($locale, $pageName, $slugObject, $slugEntityObject = null)
    {
        return PageHelper::translateUrl($locale, $pageName, $slugObject, $slugEntityObject);
    }
}

if (!function_exists('urlLastSegment')) {
    function urlLastSegment($url)
    {
        return PageHelper::urlLastSegment($url);
    }
}

if (!function_exists('getSegments')) {
    function getSegments($url)
    {
        return PageHelper::getSegments($url);
    }
}

if (!function_exists('getUrlTranslateds')) {
    function getUrlTranslateds($page, $pageSlug)
    {
        return PageHelper::getUrlTranslateds($page, $pageSlug);
    }
}

if (!function_exists('checkIfPageRequireAuthentication')) {
    function checkIfPageRequireAuthentication($page)
    {
        return PageHelper::checkIfPageRequireAuthentication($page);
    }
}

if (!function_exists('renderView')) {
    function renderView($blade, $arg = null)
    {
        return PageHelper::renderView($blade, $arg);
    }
}

if (!function_exists('getPageByName')) {
    function getPageByName($name)
    {
        return PageHelper::getPageByName($name);
    }
}

if (!function_exists('getResourcePage')) {
    function getResourcePage($page)
    {
        return PageHelper::getResourcePage($page);
    }
}


/**
 * CrudHelper
 */

if (!function_exists('toggleField')) {
    function toggleField($request)
    {
        return CrudHelper::toggleField($request);
    }
}

if (!function_exists('settingTypeSelect')) {
    function settingTypeSelect($value)
    {
        return CrudHelper::settingTypeSelect($value);
    }
}

if (!function_exists('storeReplicateOtherLocales')) {
    function storeReplicateOtherLocales($crud): void
    {
        CrudHelper::storeReplicateOtherLocales($crud);
    }
}

if (!function_exists('getUniqueSlug')) {
    function getUniqueSlug($objectId, $slug, $model, $i = 0, $first = true)
    {
        return CrudHelper::getUniqueSlug($objectId, $slug, $model, $i, $first);
    }
}

if (!function_exists('getUniqueStringId')) {
    function getUniqueStringId($slug, $model, $i = 0, $first = true)
    {
        return CrudHelper::getUniqueStringId($slug, $model, $i, $first);
    }
}

if (!function_exists('getNextID')) {
    function getNextID($table_name)
    {
        return CrudHelper::getNextID($table_name);
    }
}


/**
 * AuthHelper
 */

if (!function_exists('isAdmin')) {
    function isAdmin($user = null)
    {
        return AuthHelper::isAdmin($user);
    }
}

if (!function_exists('isSuperadmin')) {
    function isSuperadmin($user = null)
    {
        return AuthHelper::isSuperadmin($user);
    }
}

if (!function_exists('isAdminOrSuperadmin')) {
    function isAdminOrSuperadmin($user = null)
    {
        return AuthHelper::isAdminOrSuperadmin($user);
    }
}

if (!function_exists('userIsActive')) {
    function userIsActive($user)
    {
        return AuthHelper::userIsActive($user);
    }
}

if (!function_exists('getUser')) {
    function getUser()
    {
        return AuthHelper::getUser();
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
    function saveImage($disk, $path, $image)
    {
        return ImageHelper::saveImage($disk, $path, $image);
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


/**
 * MenuHelper
 */

if (!function_exists('getMenuTop')) {
    function getMenuTop()
    {
        return MenuHelper::getMenuTop();
    }
}

if (!function_exists('getMenuFooter')) {
    function getMenuFooter()
    {
        return MenuHelper::getMenuFooter();
    }
}

if (!function_exists('getMenuFooterLegal')) {
    function getMenuFooterLegal()
    {
        return MenuHelper::getMenuFooterLegal();
    }
}


/**
 * SocialNetworksHelper
 */

if (!function_exists('getSocialNetworks')) {
    function getSocialNetworks()
    {
        return SocialNetworksHelper::getSocialNetworks();
    }
}


/**
 * CacheHelper
 */


if (!function_exists('cacheKeyExists')) {
    function cacheKeyExists($key)
    {
        return CacheHelper::cacheKeyExists($key);
    }
}

if (!function_exists('getCacheKey')) {
    function getCacheKey($key)
    {
        return CacheHelper::getCacheKey($key);
    }
}

if (!function_exists('forceStoreInCache')) {
    function forceStoreInCache($tag, $query, $ttl = null)
    {
        return CacheHelper::forceStoreInCache($tag, $query, $ttl);
    }
}

if (!function_exists('deleteItemFromCache')) {
    function deleteItemFromCache($key)
    {
        return CacheHelper::deleteItemFromCache($key);
    }
}

if (!function_exists('clearCache')) {
    function clearCache()
    {
        return CacheHelper::clearCache();
    }
}


/**
 * MailHelper
 */
if (!function_exists('sendEmail')) {
    function sendEmail($data, $subject, $to = [], $formType = 'default-content', $fromAddress = null, $fromName = null, $bcc = [])
    {
        return MailHelper::sendEmail($data, $subject, $to, $formType, $fromAddress, $fromName, $bcc);
    }
}

if (!function_exists('sendEmailError')) {
    function sendEmailError($subject, $data)
    {
        return MailHelper::sendEmailError($subject, $data);
    }
}


/**
 * VersionHelper
 */
if (!function_exists('currentVersion')) {
    function currentVersion()
    {
        return VersionHelper::currentVersion();
    }
}

if (!function_exists('currentVersionObject')) {
    function currentVersionObject()
    {
        return VersionHelper::currentVersionObject();
    }
}
