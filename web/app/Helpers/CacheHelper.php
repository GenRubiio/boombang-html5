<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;

class CacheHelper
{
    protected static $defaultCacheTtl = 7200; // 2 hours

    public static function cacheKeyExists($key)
    {
        return Cache::has($key);
    }

    public static function getCacheKey($key)
    {
        return Cache::get($key);
    }

    public static function forceStoreInCache($key, $query, $ttl = null)
    {
        return Cache::put($key, function () use ($query) {
            return $query;
        }, $ttl);
    }

    public static function deleteItemFromCache($key)
    {
        return Cache::forget($key);
    }

    public static function clearCache()
    {
        return Cache::flush();
    }
}
