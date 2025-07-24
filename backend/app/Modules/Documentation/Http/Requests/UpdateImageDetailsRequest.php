<?php

namespace Modules\Documentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateImageDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'caption' => ['nullable', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ];
    }
}
