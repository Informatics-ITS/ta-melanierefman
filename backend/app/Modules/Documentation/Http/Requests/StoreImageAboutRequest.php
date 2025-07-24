<?php

namespace Modules\Documentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Documentation\Models\Documentation;

class StoreImageAboutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'about_type' => ['required', 'in:' . implode(',', Documentation::validAboutTypes())],
            'keterangan' => ['required', 'string', 'max:255'],
            'caption' => ['required', 'string', 'max:255'],
        ];
    }
}
