<?php

namespace Modules\Documentation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreImageDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'research_id' => ['required', Rule::exists('research', 'id')->whereNotNull('id')],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'caption' => ['nullable', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ];
    }
}
