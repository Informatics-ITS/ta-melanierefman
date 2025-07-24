<?php

namespace Modules\ResearchProgress\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResearchProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul_progres' => 'required|string|max:255',
            'title_progress' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'description' => 'required|string',
            'videos' => 'array',
            'videos.*.youtube_link' => 'required|string',
            'videos.*.index_order' => 'required|integer',
            'text_editors' => 'array',
            'text_editors.*.text_editor_id' => 'required|string',
            'text_editors.*.text_editor_en' => 'required|string',
            'text_editors.*.index_order' => 'required|integer',
            'images' => 'array',
            'images.*.image' => 'required|file|image|max:2048',
            'images.*.keterangan' => 'required|string',
            'images.*.caption' => 'required|string',
            'images.*.index_order' => 'required|integer',
            'maps' => 'array',
            'maps.*.latitude' => 'required|numeric',
            'maps.*.longitude' => 'required|numeric',
            'maps.*.zoom' => 'required|integer',
            'maps.*.index_order' => 'required|integer',
        ];
    }
}
