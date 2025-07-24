<?php

namespace Modules\Documentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Documentation\Models\Documentation;

class UpdateDocumentationRequest extends FormRequest
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
            'type' => ['nullable', 'in:' . implode(',', Documentation::validTypes())],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'youtube_link' => ['nullable', 'url', 'regex:/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/'],
            'keterangan' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:255'],
            'research_id' => ['nullable', 'exists:research,id'],
        ];
    }
}
