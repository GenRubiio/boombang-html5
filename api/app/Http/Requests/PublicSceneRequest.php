<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublicSceneRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // only allow updates if the user is logged in
        return backpack_auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required',
            'menu_type' => 'required',
            'max_users' => 'required|numeric',
            'map' => 'required',
            'map_width' => 'required|numeric',
            'map_height' => 'required|numeric',
            'start_x' => 'required|numeric',
            'start_y' => 'required|numeric',
            'start_z' => 'required|numeric',
        ];
    }

    /**
     * Get the validation attributes that apply to the request.
     *
     * @return array
     */
    public function attributes()
    {
        return [
            //
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array
     */
    public function messages()
    {
        return [
            //
        ];
    }
}
