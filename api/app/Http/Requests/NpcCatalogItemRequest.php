<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NpcCatalogItemRequest extends FormRequest
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
            'npc_id' => 'required|exists:npcs,id',
            'catalog_item_id' => 'required|exists:catalog_items,id',
            'active' => 'boolean',
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
            'npc_id' => 'NPC',
            'catalog_item_id' => 'Objeto del Catálogo',
            'active' => 'Activo',
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
            'npc_id.required' => 'El campo NPC es obligatorio',
            'npc_id.exists' => 'El NPC seleccionado no existe',
            'catalog_item_id.required' => 'El campo Objeto del Catálogo es obligatorio',
            'catalog_item_id.exists' => 'El Objeto del Catálogo seleccionado no existe',
        ];
    }
}
