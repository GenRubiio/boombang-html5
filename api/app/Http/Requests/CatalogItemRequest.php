<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CatalogItemRequest extends FormRequest
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
        $rules = [
            'name' => 'required',
            'category_id' => 'required|exists:catalog_categories,id',
            'description' => 'required',
            'sprite_name' => 'required|unique:catalog_items,sprite_name,' . $this->route('id') . ',id',
            'image' => 'required',
            'atlas' => 'nullable|json',
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'price_type' => 'required|in:golden_coins,silver_coins,stripe_payment',
            'stripe_price_usd' => 'nullable|numeric|min:0.01|required_if:price_type,stripe_payment',
            'reward_type' => 'required|in:item,golden_coins,silver_coins,mixed',
            'reward_golden_coins' => 'nullable|numeric|min:0|required_if:reward_type,golden_coins,mixed',
            'reward_silver_coins' => 'nullable|numeric|min:0|required_if:reward_type,silver_coins,mixed',
            //'spreadsheet' => 'required',
        ];

        return $rules;
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
            'stripe_price_usd.required_if' => 'El precio en USD es requerido cuando el tipo de precio es "Pago Real (Stripe)".',
            'stripe_price_usd.min' => 'El precio en USD debe ser mayor a $0.01.',
            'reward_golden_coins.required_if' => 'Debe especificar la cantidad de créditos de oro cuando el tipo de recompensa incluye oro.',
            'reward_silver_coins.required_if' => 'Debe especificar la cantidad de créditos de plata cuando el tipo de recompensa incluye plata.',
            'price_type.in' => 'El tipo de precio debe ser uno de: Monedas Doradas, Monedas Plateadas, o Pago Real (Stripe).',
            'reward_type.in' => 'El tipo de recompensa debe ser uno de: Entregar Item, Créditos de Oro, Créditos de Plata, o Mixto.',
        ];
    }
}
