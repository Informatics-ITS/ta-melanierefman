<?php

namespace Modules\Documentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Documentation\Models\Documentation;

class UpdateImageAboutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'about_type' => ['nullable', 'in:' . implode(',', Documentation::validAboutTypes())],
            'keterangan' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:255'],
        ];
    }
}
