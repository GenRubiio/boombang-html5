<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PrivateSceneConfigRequest extends FormRequest
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
            'island_type' => 'required',
            'image' => 'nullable',
            'max_users' => 'required|integer|min:1|max:12',
            'map_width' => 'required|integer',
            'map_height' => 'required|integer',
            'map' => 'required|string',
            'start_x' => 'required|integer|min:0',
            'start_y' => 'required|integer|min:0',
            'start_z' => 'required|integer|min:0',
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
