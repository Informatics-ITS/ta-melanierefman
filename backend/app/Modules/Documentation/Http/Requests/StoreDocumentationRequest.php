<?php

namespace Modules\Documentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Documentation\Models\Documentation;

class StoreDocumentationRequest extends FormRequest
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
            'type' => ['required', 'in:' . implode(',', Documentation::validTypes())],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'youtube_link' => ['nullable', 'url', 'regex:/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/'],
            'keterangan' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:255'],
            'research_id' => ['required', 'exists:research,id'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->type === 'video' && empty($this->youtube_link)) {
                $validator->errors()->add('youtube_link', 'YouTube link is required for video type.');
            }

            if ($this->type === 'image' && !$this->hasFile('image')) {
                $validator->errors()->add('image', 'Image file is required for image type.');
            }
        });
    }
}
