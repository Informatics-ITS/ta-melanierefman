<?php

namespace Modules\Partner\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePartnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'research_id' => ['sometimes', 'integer', 'exists:research,id'],
            'partners_member' => ['sometimes', 'array'],
            'partners_member.*.id' => ['sometimes', 'integer', 'exists:partners_member,id'],
            'partners_member.*.name' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
