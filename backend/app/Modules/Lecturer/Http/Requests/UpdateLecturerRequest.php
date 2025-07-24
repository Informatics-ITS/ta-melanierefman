<?php

namespace Modules\Lecturer\Http\Requests;

use Modules\Lecturer\Models\Lecturer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class UpdateLecturerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'judul' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'in:' . implode(',', Lecturer::validTypes())],
            'doc_type' => ['nullable', 'in:' . implode(',', Lecturer::validDocTypes())],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:10240'],
            'file' => ['nullable', 'file', 'mimes:pdf,ppt,pptx,doc,docx,xls,xlsx,txt,odt,ods', 'max:10240'],
            'youtube_link' => ['nullable', 'url', 'regex:/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/'],
            'kata_kunci' => ['nullable', 'string', 'max:255'],
            'keyword' => ['nullable', 'string', 'max:255'],
        ];
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
