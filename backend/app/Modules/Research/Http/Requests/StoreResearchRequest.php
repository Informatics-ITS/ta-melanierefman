<?php

namespace Modules\Research\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'judul' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'deskripsi' => ['required', 'string'],
            'description' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'zoom' => ['nullable', 'integer'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'keterangans' => ['nullable', 'array'],
            'keterangans.*' => ['nullable', 'string', 'max:255'],
            'captions' => ['nullable', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
            'start_month' => ['nullable', 'integer', 'between:1,12'],
            'start_year' => ['nullable', 'integer'],
            'end_month' => ['nullable', 'integer', 'between:1,12'],
            'end_year' => ['nullable', 'integer'],
            'coordinator_id' => ['required', 'exists:members,id'],
            'member_ids' => ['nullable', 'array'],
            'member_ids.*' => ['exists:members,id'],
        ];
    }
}
