<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MailRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Permitir acceso solo a usuarios autenticados
        return backpack_auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'is_active' => 'sometimes|boolean',
            'send_to_all' => 'sometimes|boolean',
            'is_persistent' => 'sometimes|boolean',
            'gold_coins' => 'sometimes|integer|min:0',
            'silver_coins' => 'sometimes|integer|min:0',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
            'rewards' => 'nullable|array',
            'rewards.*.catalog_item_id' => 'required_with:rewards|exists:catalog_items,id',
            'rewards.*.quantity' => 'required_with:rewards|integer|min:1',
        ];
    }

    /**
     * Get the validation messages.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio',
            'title.max' => 'El título no puede exceder 255 caracteres',
            'description.required' => 'La descripción es obligatoria',
            'user_ids.*.exists' => 'Uno o más usuarios seleccionados no existen',
            'rewards.*.catalog_item_id.exists' => 'Uno o más objetos del catálogo no existen',
            'rewards.*.quantity.min' => 'La cantidad debe ser al menos 1',
        ];
    }
}
