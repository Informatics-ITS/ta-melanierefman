<?php

namespace Modules\Lecturer\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class LecturerFileService
{
    public function handleFileUpload(array $validated, string $path): ?string
    {
        if (!isset($validated['file']) || !$validated['file']) {
            return null;
        }

        return $this->storeFile($validated['file'], $path);
    }

    public function handleThumbnailUpload(array $validated, string $path): ?string
    {
        if (!isset($validated['thumbnail']) || !$validated['thumbnail']) {
            return null;
        }

        return $this->storeFile($validated['thumbnail'], $path);
    }

    public function handleFileUpdate(Request $request, ?string $currentPath, string $storagePath): ?string
    {
        if (!$request->hasFile('file')) {
            return $currentPath;
        }

        $this->deleteFileIfExists($currentPath);
        return $this->storeFile($request->file('file'), $storagePath);
    }

    public function handleThumbnailUpdate(Request $request, ?string $currentPath, string $storagePath): ?string
    {
        if (!$request->hasFile('thumbnail')) {
            return $currentPath;
        }

        $this->deleteFileIfExists($currentPath);
        return $this->storeFile($request->file('thumbnail'), $storagePath);
    }

    public function deleteFiles(?string ...$filePaths): void
    {
        foreach ($filePaths as $filePath) {
            $this->deleteFileIfExists($filePath);
        }
    }

    private function storeFile(UploadedFile $file, string $path): string
    {
        $filename = $this->generateFilename($file);
        return $file->storeAs($path, $filename, 'public');
    }

    private function generateFilename(UploadedFile $file): string
    {
        return now()->format('YmdHis') . '.' . $file->getClientOriginalExtension();
    }

    private function deleteFileIfExists(?string $filePath): void
    {
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }
    }
}
