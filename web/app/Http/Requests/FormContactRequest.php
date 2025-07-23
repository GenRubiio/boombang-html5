<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class FormContactRequest extends FormRequest
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
            'url_origin' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'message' => 'required|string',
            'email' => 'required|email',
            'accept_terms' => 'accepted',
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
            'name.required' => trans('form.contact_form_errors.name_required'),
            'name.string' => trans('form.contact_form_errors.name_string'),
            'name.max' => trans('form.contact_form_errors.name_max'),
            'message.required' => trans('form.contact_form_errors.message_required'),
            'message.string' => trans('form.contact_form_errors.message_string'),
            'message.max' => trans('form.contact_form_errors.message_max'),
            'email.required' => trans('form.contact_form_errors.email_required'),
            'email.email' => trans('form.contact_form_errors.email_email'),
        ];
    }

    protected function prepareForValidation()
    {
        $lang = LaravelLocalization::getCurrentLocale();
        if (in_array($lang, array_keys(LaravelLocalization::getSupportedLocales()))) {
            LaravelLocalization::setLocale($lang);
        }
    }
}
