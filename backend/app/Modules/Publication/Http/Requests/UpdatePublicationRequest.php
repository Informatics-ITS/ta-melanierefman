<?php

namespace Modules\Publication\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePublicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'research_id' => ['nullable', 'exists:research,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'digits:4'],
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
