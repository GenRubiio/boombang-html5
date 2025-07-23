<?php

namespace App\Helpers;

use Exception;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class ImageHelper
{
    public static function generateMobileImage($disk, $image, $filename, $destination_path)
    {
        $image = self::resizeImage($image, config('images.mobile_max_width'));
        $filename = self::addToNameImage($filename, config('images.mobile_add_name'), getExtensionByMimetype($image->mime()));
        return self::saveImage($disk, $destination_path . '/' . $filename, $image, config('images.webp_quality'));
    }

    public static function generateThumbnailImage($disk, $image, $filename, $destination_path)
    {
        $image = self::resizeImage($image, config('images.thumbnail_max_width'));
        $filename = self::addToNameImage($filename, config('images.thumbnail_add_name'), getExtensionByMimetype($image->mime()));
        return self::saveImage($disk, $destination_path . '/' . $filename, $image, config('images.webp_quality'));
    }

    public static function addToNameImage($filename, $addToFileName, $extension)
    {
        return str_replace($extension, $addToFileName . $extension, $filename);
    }

    public static function saveImage($disk, $path, $image, $quality)
    {
        $quality = $quality ?? config('images.webp_quality');
        $mime = $image->mime();
        $isRaster = in_array($mime, ['image/jpeg', 'image/jpg', 'image/png'], true);

        if ($isRaster) {
            $path = preg_replace('/\.(jpe?g|png)$/i', '.webp', $path);
            $stream = $image->encode('webp', $quality)->stream();
        } else {
            $stream = $image->stream();
        }

        Storage::disk($disk)->put($path, $stream);
        return true;
    }

    public static function resizeImage($image, $maxWidth = null, $maxHeight = null)
    {
        $maxWidth = $maxWidth ?? config('images.desktop_max_width');
        return $image->resize($maxWidth, $maxHeight, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
    }

    public static function genericImageMutator(
        $entity,
        $value,
        $destination,
        $filename,
        $attribute = "image",
        $acceptSvg = true,
        $disk = "uploads",
        $maxWidthSize = null,
        $maxHeightSize = null
    ) {
            $maxWidthSize ?? config('images.desktop_max_width');
            $maxHeightSize ?? config('images.desktop_max_heigth');

        // if the image was erased
        if ($value == null) {
            // delete the image from disk
            removeFile($disk, $entity->{$attribute});

            // set null in the database column
            return null;
        }

        // if a base64 was sent, store it in the db
        if ($acceptSvg && Str::startsWith($value, 'data:image/svg+xml')) {
            $filename = $filename . '.svg';
            $value = str_replace('data:image/svg+xml;base64,', '', $value);
            $value = str_replace(' ', '+', $value);
            removeFile($disk, $entity->{$attribute});
            if (!File::exists($destination)) {
                mkdir($destination);
            }
            File::put($destination . '/' . $filename, base64_decode($value));
            return $destination . '/' . $filename;
        } elseif (Str::startsWith($value, 'data:image')) {
            // 0. Make the image
            $image = Image::make($value);
            $extension = getExtensionByMimetype($image->mime());
            // 1. Generate a filename.
            $filename = $filename . $extension;
            // 2. Store the image on disk.
            //Optimize max size and save
            resizeImage($image, $maxWidthSize, $maxHeightSize);
            removeFile($disk, $entity->{$attribute});
            saveImage($disk, $destination . '/' . $filename, $image, config('images.webp_quality'));

            // 3. Save the path to the database
            return $destination . '/' . $filename;
        }
        return $entity->{$attribute};
    }

    public static function injectSvg($path, $alt = null, $title = null): string
    {
        $alt = !is_null($alt) ? strip_tags($alt) : null;
        $title = !is_null($title) ? strip_tags($title) : null;

        $path = str_ends_with($path, '.svg') ? str_replace(config('app.url'), '', $path) : $path;
        if (substr($path, 0, 1) == '/') {
            $path = substr($path, 1);
        }
        if (str_ends_with($path, '.svg') && file_exists($path)) {
            try {
                $svgContent = file_get_contents($path);

                preg_match_all('/\.([a-zA-Z0-9_-]+)\s*\{/', $svgContent, $matches);
                $classNames = $matches[1];
                $newClassNames = [];
                foreach ($classNames as $className) {
                    $alphabet = 'abcdefghijklmnopqrstuvwxyz';
                    $shuffleAlphabet = str_shuffle($alphabet);
                    $randomName = substr($shuffleAlphabet, 0, 5);
                    $newClassNames[$className] = $randomName;
                }
                foreach ($newClassNames as $originalName => $randomName) {
                    $svgContent = str_replace($originalName, $randomName, $svgContent);
                }

                if (!is_null($alt) || !is_null($title)) {
                    $ariaLabel = $alt;
                    if ($alt != $title) {
                        $ariaLabel = $alt . ' ' . $title;
                    }
                    $svgContent = str_replace('<svg', '<svg aria-label="' . $ariaLabel . '"', $svgContent);
                    $svgContent = str_replace('<svg', '<svg aria-labelledby="' . $ariaLabel . '"', $svgContent);
                }
                if (!is_null($alt)) {
                    $svgContent = str_replace('</svg>', '<title>' . $alt . '</title></svg>', $svgContent);
                }
                if (!is_null($title)) {
                    $svgContent = str_replace('</svg>', '<description>' . $alt . '</description></svg>', $svgContent);
                }
                return $svgContent;
            } catch (Exception $e) {
                return "<img src='" . $path . "' alt='" . $alt . "' title='" . $title . "' loading='lazy'>";
            }
        }
        return "<img src='" . $path . "' alt='" . $alt . "' title='" . $title . "' loading='lazy'>";
    }

    public static function injectPictureTag(
        string      $imageDefault,
        array       $images,
        string|null $id = null,
        string|null $class = null,
        string      $alt = '',
        string      $title = '',
        bool        $lazy = true
    ): string {
        $configSizes = config('images');
        $defaultWidthSizes = [
            'desktop' => $configSizes['desktop_max_width'],
            'tablet' => $configSizes['tablet_max_width'],
            'mobile' => $configSizes['mobile_max_width'],
            'thumbnail' => $configSizes['thumbnail_max_width'],
        ];

        $lazyAttribute = $lazy ? 'loading="lazy"' : '';
        $idAttribute = $id ? ' id="' . $id . '"' : '';
        $classAttribute = $class ? ' class="' . $class . '"' : '';
        $title = $title ?: $alt;

        $pictureTag = "<picture" . $idAttribute . $classAttribute . ">";
        foreach ($images as $size => $image) {
            if (!Str::endsWith($image, '.svg') && isset($defaultWidthSizes[$size])) {
                $pictureTag .= "<source media='(min-width:" . $defaultWidthSizes[$size] . "px)' srcset='" . $image . "'>";
            }
        }
        $pictureTag .= "<img src='" . $imageDefault . "' " . $classAttribute . " alt='" . $alt . "' title='" . $title . "' " . $lazyAttribute . "></picture>";
        return $pictureTag;
    }
}
