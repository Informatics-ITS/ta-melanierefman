<?php

namespace Modules\Publication\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'research_id' => ['nullable', 'exists:research,id'],
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'digits:4'],
            'name_journal' => ['nullable', 'string'],
            'volume' => ['nullable', 'integer'],
            'issue' => ['nullable', 'integer'],
            'page' => ['nullable', 'string'],
            'DOI_link' => ['nullable', 'string', 'max:255'],
            'article_link' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
        ];
    }
}
