<?php

namespace Modules\Lecturer\Http\Requests;

use Modules\Lecturer\Models\Lecturer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class StoreLecturerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer'],
            'judul' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:' . implode(',', Lecturer::validTypes())],
            'doc_type' => ['nullable', 'in:' . implode(',', Lecturer::validDocTypes())],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'file' => ['nullable', 'file', 'mimes:pdf,ppt,pptx,doc,docx,xls,xlsx,txt,odt,ods', 'max:10240'],
            'youtube_link' => ['nullable', 'url', 'regex:/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/'],
            'kata_kunci' => ['nullable', 'string', 'max:255'],
            'keyword' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->hasFile('file') && empty($this->input('youtube_link'))) {
                $validator->errors()->add('file', 'Either file or YouTube link must be provided.');
            }
        });
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
