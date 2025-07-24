<?php

namespace Modules\ResearchProgress\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateResearchProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul_progres' => 'nullable|string|max:255',
            'title_progress' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'description' => 'nullable|string',
            'videos' => 'array',
            'videos.*.youtube_link' => 'nullable|string',
            'videos.*.index_order' => 'required|integer',
            'text_editors' => 'array',
            'text_editors.*.text_editor_id' => 'nullable|string',
            'text_editors.*.text_editor_en' => 'nullable|string',
            'text_editors.*.index_order' => 'required|integer',
            'images' => 'array',
            'images.*.image' => 'nullable',
            'images.*.keterangan' => 'nullable|string',
            'images.*.caption' => 'nullable|string',
            'images.*.index_order' => 'required|integer',
            'maps' => 'array',
            'maps.*.latitude' => 'nullable|numeric',
            'maps.*.longitude' => 'nullable|numeric',
            'maps.*.zoom' => 'nullable|integer',
            'maps.*.index_order' => 'required|integer',
        ];
    }
}
