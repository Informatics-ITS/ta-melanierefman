<?php

namespace Modules\Partner\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'research_id' => ['required', 'integer', 'exists:research,id'],
            'members' => ['required', 'array'],
            'members.*.name' => ['required', 'string', 'max:255'],
        ];
    }
}
