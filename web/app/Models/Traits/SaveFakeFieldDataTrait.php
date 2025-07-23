<?php

namespace App\Models\Traits;

use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\File;
use Illuminate\Http\UploadedFile;

trait SaveFakeFieldDataTrait
{
    public function processDataRecursively(&$value, $destinationPath = null)
    {
        foreach ($value as $key => &$subValue) {
            if (str_contains($key, 'image') && !is_array($subValue)) {
                $subValue = $this->saveImgInFakeField($subValue, $destinationPath);
            } elseif (str_contains($key, 'file') && !is_array($subValue)) {
                $subValue = $this->saveFileInFakeField($subValue, $destinationPath);
            } elseif (is_array($subValue)) {
                $this->processDataRecursively($subValue, $destinationPath);
            }
        }
    }

    private function saveFileInFakeField($value, $destinationPath, $name = null)
    {
        try {
            if ($value instanceof UploadedFile) {
                $name = $name ? $name : Str::random(10);
                if ($value == null) {
                    return null;
                }
                $name = $name . '.' . $value->getClientOriginalExtension();
                if (!File::exists($destinationPath)) {
                    File::makeDirectory($destinationPath, 0777, true, true);
                }
                $value->move($destinationPath, $name);
                return $destinationPath . '/' . $name;
            }
            if (!Str::startsWith($value, 'data:')) {
                return $value;
            }
        } catch (\Exception $e) {
        }
        return null;
    }

    private function saveImgInFakeField($value, $destinationPath)
    {
        try {
            $name = Str::random(10);
            $disk = "uploads";
            if ($value == null) {
                return null;
            }
            $filename = Str::slug($name);
            if (Str::startsWith($value, 'data:image/svg+xml')) {
                if (!File::exists($destinationPath)) {
                    File::makeDirectory($destinationPath, 0777, true, true);
                }
                $filename = $filename . '.svg';
                $value = str_replace('data:image/svg+xml;base64,', '', $value);
                $value = str_replace(' ', '+', $value);
                File::put($destinationPath . '/' . $filename, base64_decode($value));
                return $destinationPath . '/' . $filename;
            } elseif (Str::startsWith($value, 'data:image')) {
                if (!File::exists($destinationPath)) {
                    File::makeDirectory($destinationPath, 0777, true, true);
                }
                $image = Image::make($value);
                $extension = getExtensionByMimetype($image->mime());
                $filename = $filename . $extension;
                resizeImage($image, null, null);
                saveImage($disk, $destinationPath . '/' . $filename, $image);
                return $destinationPath . '/' . $filename;
            }
            return $value;
        } catch (\Exception $e) {
            return null;
        }
    }
}
