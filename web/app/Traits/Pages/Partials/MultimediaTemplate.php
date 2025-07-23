<?php

namespace App\Traits\Pages\Partials;

trait MultimediaTemplate
{
    protected function multimedia($images, $videos, $files)
    {
        $galleryableId = !is_null($this->crud->entry) ? $this->crud->entry->id : $this->crud->getRequest()->get('id');
        $galleryableType = 'App\Models\\'.getClassName($this->crud->model);

        /*Images*/
        if ($images) {
            //$this->crud->addButtonFromModelFunction($stack, $name, $model_function_name, $position);
            $this->crud->addFields([
                [   // CustomHTML
                    'name' => 'images_separator',
                    'type' => 'custom_html',
                    'value' => '<br><h2>' . trans('admin.gallery_images') . '</h2><hr>',
                    'tab' => $this->image_tab,
                ],
                [   // CustomHTML
                    'name' => 'images_explanation',
                    'type' => 'custom_html',
                    'value' => '<h6><i>' . trans('admin.gallery_images_explanation') . '</i></h6>',
                    'tab' => $this->image_tab,
                ],
                [
                    'name' => 'reorder_images',
                    'type' => 'custom_html',
                    'value' => '<h5>Ordenar imágenes</h5>
                                <a href='.backpack_url('gallery/reorder?filterType=header&filterGalleryableType='.$galleryableType.'&filterGalleryableId='.$galleryableId.'&filterMultimedia=image').' class="btn btn-outline-primary mr-3">'.trans('admin.gallery_order_header').'</a>
                                <a href='.backpack_url('gallery/reorder?filterType=content&filterGalleryableType='.$galleryableType.'&filterGalleryableId='.$galleryableId.'&filterMultimedia=image').' class="btn btn-outline-primary mr-3">'.trans('admin.gallery_order_content').'</a>
                                <a href='.backpack_url('gallery/reorder?filterType=extra&filterGalleryableType='.$galleryableType.'&filterGalleryableId='.$galleryableId.'&filterMultimedia=image').' class="btn btn-outline-primary mr-3">'.trans('admin.gallery_order_extra').'</a>
                                ',
                    'tab' => $this->image_tab,
                ],
                [   // Gallery image
                    'label' => trans('admin.gallery_image'),
                    'name' => 'image_galleries',
                    'type' => 'gallery_image',
                    'object' => $this->crud->entry,
                    'upload' => true,
                    'crop' => true, // set to true to allow cropping, false to disable
                    'aspect_ratio' => 0, // ommit or set to 0 to allow any aspect ratio
                    // 'disk' => 's3_bucket', // in case you need to show images from a different disk
                    // 'prefix' => 'uploads/images/profile_pictures/' // in case you only store the filename in the database, this text will be prepended to the database value
                    'tab' => $this->image_tab,
                ]
            ]);
        }
        /*Videos*/
        if ($videos) {
            $this->crud->addFields([
                [   // CustomHTML
                    'name' => 'videos_separator',
                    'type' => 'custom_html',
                    'value' => '<br><h2>' . trans('admin.gallery_videos') . '</h2><hr>',
                    'tab' => $this->video_tab,
                ],
                [   // CustomHTML
                    'name' => 'videos_explanation',
                    'type' => 'custom_html',
                    'value' => '<h6><i>' . trans('admin.gallery_videos_explanation') . '</i></h6>',
                    'tab' => $this->video_tab,
                ],
                [
                    'name' => 'reorder_videos',
                    'type' => 'custom_html',
                    'value' => '<h5>Ordenar videos</h5>
                                <a href='.backpack_url('gallery/reorder?filterType=header&filterGalleryableType='.$galleryableType.'&filterGalleryableId='.$galleryableId.'&filterMultimedia=video').' class="btn btn-outline-primary mr-3">'.trans('admin.gallery_order_header').'</a>
                                <a href='.backpack_url('gallery/reorder?filterType=content&filterGalleryableType='.$galleryableType.'&filterGalleryableId='.$galleryableId.'&filterMultimedia=video').' class="btn btn-outline-primary mr-3">'.trans('admin.gallery_order_content').'</a>
                                <a href='.backpack_url('gallery/reorder?filterType=extra&filterGalleryableType='.$galleryableType.'&filterGalleryableId='.$galleryableId.'&filterMultimedia=video').' class="btn btn-outline-primary mr-3">'.trans('admin.gallery_order_extra').'</a>
                                ',
                    'tab' => $this->video_tab,
                ],
                [ // Gallery video
                    'label' => trans('admin.gallery_video'),
                    'name' => 'video_galleries',
                    'type' => 'gallery_video',
                    'object' => $this->crud->entry,
                    'tab' => $this->video_tab,
                ]
            ]);
        }
        /*Files*/
        if ($files) {
            $this->crud->addFields([
                [   // CustomHTML
                    'name' => 'files_separator',
                    'type' => 'custom_html',
                    'value' => '<br><h2>' . trans('admin.gallery_files') . '</h2><hr>',
                    'tab' => $this->file_tab,
                ],
                [   // CustomHTML
                    'name' => 'files_explanation',
                    'type' => 'custom_html',
                    'value' => '<h6><i>' . trans('admin.gallery_files_explanation') . '</i></h6>',
                    'tab' => $this->file_tab,
                ],
                [
                    'name' => 'reorder_files',
                    'type' => 'custom_html',
                    'value' => '<h5>Ordenar archivos</h5>
                                <a href='.backpack_url('gallery/reorder?filterType=header&filterGalleryableType='.$galleryableType.'&filterGalleryableId='.$galleryableId.'&filterMultimedia=file').' class="btn btn-outline-primary mr-3">'.trans('admin.gallery_order_header').'</a>
                                <a href='.backpack_url('gallery/reorder?filterType=content&filterGalleryableType='.$galleryableType.'&filterGalleryableId='.$galleryableId.'&filterMultimedia=file').' class="btn btn-outline-primary mr-3">'.trans('admin.gallery_order_content').'</a>
                                <a href='.backpack_url('gallery/reorder?filterType=extra&filterGalleryableType='.$galleryableType.'&filterGalleryableId='.$galleryableId.'&filterMultimedia=file').' class="btn btn-outline-primary mr-3">'.trans('admin.gallery_order_extra').'</a>
                                ',
                    'tab' => $this->file_tab,
                ],
                [ // Gallery file
                    'label' => trans('admin.gallery_file'),
                    'name' => 'file_galleries',
                    'type' => 'gallery_file',
                    'object' => $this->crud->entry,
                    'group' => 'file',
                    'relation' => 'files',
                    'wrapperAttributes' => [
                        'class' => 'form-group file'
                    ],
                    'tab' => $this->file_tab,
                    // 'max_num' => 1
                ]
            ]);
        }
    }
}
