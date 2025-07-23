<?php

namespace App\Observers;

use App\Models\Gallery;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class GalleryObserver
{
    public function saved($object)
    {
        $className = getClassName($object);
        $request = Request::instance();
        if (!$request->has('already_been_saved')) {
            $inputs = $request->gallery;
            $disk = "uploads";
            if (is_array($inputs) && count($inputs)) {
                foreach ($inputs as $id => $inputArray) {
                    if (array_key_exists('file', $inputArray)) {
                        $positionFile = $inputArray['file'];
                        unset($inputArray['file']);
                        $inputArray = ['file' => $positionFile] + $inputArray;
                    }
                    $type = array_keys($inputArray)[0]; //image, file or video
                    $id = str_contains($id, "new_{$type}_") ? $this->getNextID('galleries') : $id;

                    if (array_key_exists(
                        $type,
                        $inputArray
                    ) && is_null($inputArray[$type])) { // Eliminamos las imágenes del disco
                        $existingGallery = Gallery::find($id);
                        if (!is_null($existingGallery)) {
                            if ($inputArray[$type] != "video" && is_string($existingGallery->$type) && Storage::disk($disk)->exists($existingGallery->$type)) {
                                if ($type == 'image') {
                                    $image = Image::make($existingGallery->$type);
                                    $extension = getExtensionByMimetype($image->mime());
                                    $pathThumbnail = addToNameImage($existingGallery->$type, '-thumbnail', $extension);
                                    removeFile($disk, $pathThumbnail);
                                    $pathMobile = addToNameImage($existingGallery->$type, '-mobile', $extension);
                                    removeFile($disk, $pathMobile);
                                    removeFile($disk, $existingGallery->$type);
                                } else {
                                    Storage::disk($disk)->delete($existingGallery->$type);
                                }
                            }
                            $existingGallery->delete();
                        }
                    } else { // Creamos o actualizamos nueva imagen. Guardamos la imagen con el Mutator del modelo Gallery
                        if (!isset($inputArray['name']) || $inputArray['name'] == "") {
                            $inputArray['name'] = $className;
                        }
                        if (!isset($inputArray['alt']) || $inputArray['alt'] == "") {
                            $inputArray['alt'] = $inputArray['name'];
                        }
                        if (!isset($inputArray['title']) || $inputArray['title'] == "") {
                            $inputArray['title'] = $inputArray['name'];
                        }

                        $filename = "{$inputArray['name']}-{$id}";
                        $inputArray['filename'] = $filename;
                        Request::merge(['filename' => $filename]);

                        $destinationPath = Str::slug($className . " " . $object->id);
                        $inputArray['destinationPath'] = $destinationPath;
                        Request::merge(['destinationPath' => $destinationPath]);

                        $newObject = Gallery::updateOrCreate([
                            'id' => $id,
                            'galleryable_id' => $object->id,
                            'galleryable_type' => get_class($object)
                        ], $inputArray);

                        if ($newObject->wasRecentlyCreated) {
                            self::setReplicateOtherLocales($newObject);
                        }
                    }
                }
            }
        }
        Request::merge(['already_been_saved' => true]);
    }

    public function setReplicateOtherLocales($model)
    {
        $crud = new \stdClass();
        $crud->entry = $model;
        $crud->model = $model;
        storeReplicateOtherLocales($crud);
    }

    public function getNextID($table_name)
    {
        $statement = DB::select("show table status like '{$table_name}'");
        return $statement[0]->Auto_increment;
    }
}
