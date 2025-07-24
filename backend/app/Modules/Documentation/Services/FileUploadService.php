<?php

namespace Modules\Documentation\Services;

use Illuminate\Http\UploadedFile;

class FileUploadService
{
    public function uploadImage(UploadedFile $file, bool $withUniqid = false, string $subfolder = ''): string
    {
        $filename = $this->generateFilename($file, $withUniqid);
        $path = $this->generatePath($subfolder);

        return $file->storeAs($path, $filename, 'public');
    }

    private function generateFilename(UploadedFile $file, bool $withUniqid): string
    {
        $timestamp = now()->format('YmdHis');
        $extension = $file->getClientOriginalExtension();

        return $withUniqid
            ? $timestamp . '-' . uniqid() . '.' . $extension
            : $timestamp . '.' . $extension;
    }

    private function generatePath(string $subfolder): string
    {
        return $subfolder
            ? "documentation/{$subfolder}"
            : 'documentation';
    }
}
