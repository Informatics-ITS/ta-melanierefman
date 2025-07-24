<?php

namespace Modules\Member\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Member\Models\Member;
use Modules\Member\Models\MemberExpertise;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'in:' . implode(',', Member::validRoles())],
            'is_alumni' => ['nullable', 'boolean'],
            'is_head' => ['nullable', 'boolean'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:members,email'],
            'phone' => ['nullable', 'string', 'max:255'],
            'scopus_link' => ['nullable', 'url'],
            'scholar_link' => ['nullable', 'url'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'judul_project' => ['nullable', 'string', 'max:255'],
            'project_title' => ['nullable', 'string', 'max:255'],
            'expertise_ids' => ['nullable', 'array'],
            'expertise_ids.*' => ['integer', 'min:1'],
            'educations' => ['nullable', 'array'],
            'educations.*.degree' => ['nullable', 'string', 'max:255'],
            'educations.*.major' => ['nullable', 'string', 'max:255'],
            'educations.*.university' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Additional validation for expertise_ids
            if ($this->has('expertise_ids') && !empty($this->expertise_ids)) {
                $existingIds = MemberExpertise::whereIn('id', $this->expertise_ids)->pluck('id')->toArray();
                $missingIds = array_diff($this->expertise_ids, $existingIds);

                if (!empty($missingIds)) {
                    $validator->errors()->add('expertise_ids', 'Some expertise IDs do not exist in the database: ' . implode(', ', $missingIds));
                }
            }
        });
    }
}
