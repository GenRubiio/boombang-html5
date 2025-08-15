<?php

namespace App\Http\Requests;

use App\Enums\AvatarEnum;
use App\Rules\RecaptchaV2;
use Illuminate\Foundation\Http\FormRequest;

class RegisterApiRegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'username' => 'required|unique:users,username|max:10',
            'email' => 'required|email|unique:users,email',
            'password' => 'required',
            'avatar_id' => [
                'required',
                'integer',
                'in:' . implode(',', array_values(AvatarEnum::registerAvatarPermited())),
            ],
            'recaptcha' => ['required', 'string', new RecaptchaV2()],
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
            'email.required' => 'Email is required',
            'email.email' => 'Email is invalid',
            'password.required' => 'Password is required',
            'username.required' => 'Username is required',
            'username.unique' => 'Username is already taken',
            'username.max' => 'Username is too long',
            'avatar_id.required' => 'Avatar is required',
            'avatar_id.integer' => 'Avatar is invalid',
            'avatar_id.in' => 'Avatar is invalid',
            'recaptcha.required' => 'reCAPTCHA is required',
        ];
    }
}
