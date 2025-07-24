<?php

namespace Modules\Research\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateResearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'zoom' => ['nullable', 'integer'],
            'keterangans' => ['nullable', 'array'],
            'keterangans.*' => ['nullable', 'string', 'max:255'],
            'captions' => ['nullable', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
            'start_month' => ['nullable', 'integer', 'between:1,12'],
            'start_year' => ['nullable', 'integer'],
            'end_month' => ['nullable', 'integer', 'between:1,12'],
            'end_year' => ['nullable', 'integer'],
            'coordinator_id' => ['nullable', 'exists:members,id'],
            'member_ids' => ['nullable', 'array'],
            'member_ids.*' => ['exists:members,id'],
        ];
    }
}
