<?php

namespace Modules\Lecturer\Services;

use Modules\Lecturer\Models\Lecturer;
use Modules\Lecturer\Services\LecturerFileService;
use Illuminate\Http\Request;

class LecturerTypeHandlerService
{
    protected LecturerFileService $fileService;

    public function __construct(LecturerFileService $fileService)
    {
        $this->fileService = $fileService;
    }

    public function handleTypeChange(
        Lecturer $lecturer,
        string $oldType,
        string $newType,
        array $validated,
        Request $request
    ): array {
        if ($oldType === $newType) {
            return $this->handleSameType($lecturer, $newType, $validated, $request);
        }

        if ($this->isFileToVideoChange($oldType, $newType)) {
            return $this->handleFileToVideoChange($lecturer, $validated);
        }

        if ($this->isVideoToFileChange($oldType, $newType)) {
            return $this->handleVideoToFileChange($lecturer, $validated, $request);
        }

        return $this->handleSameType($lecturer, $newType, $validated, $request);
    }

    private function handleSameType(Lecturer $lecturer, string $type, array $validated, Request $request): array
    {
        if ($type === 'video') {
            return $this->getVideoTypeData($lecturer, $validated);
        }

        return $this->getFileTypeData($lecturer, $validated, $request);
    }

    private function handleFileToVideoChange(Lecturer $lecturer, array $validated): array
    {
        $this->fileService->deleteFiles($lecturer->file, $lecturer->thumbnail);

        return [
            'file' => null,
            'doc_type' => null,
            'thumbnail' => null,
            'kata_kunci' => null,
            'keyword' => null,
            'youtube_link' => $validated['youtube_link'] ?? null,
        ];
    }

    private function handleVideoToFileChange(Lecturer $lecturer, array $validated, Request $request): array
    {
        $fileData = $this->getFileTypeData($lecturer, $validated, $request);
        $fileData['youtube_link'] = null;

        return $fileData;
    }

    private function getVideoTypeData(Lecturer $lecturer, array $validated): array
    {
        return [
            'youtube_link' => $validated['youtube_link'] ?? $lecturer->youtube_link,
            'file' => $lecturer->file,
            'doc_type' => $lecturer->doc_type,
            'thumbnail' => $lecturer->thumbnail,
            'kata_kunci' => $lecturer->kata_kunci,
            'keyword' => $lecturer->keyword,
        ];
    }

    private function getFileTypeData(Lecturer $lecturer, array $validated, Request $request): array
    {
        $filePath = $this->fileService->handleFileUpdate($request, $lecturer->file, 'lecturers');
        $thumbnailPath = $this->fileService->handleThumbnailUpdate($request, $lecturer->thumbnail, 'lecturers/thumbnails');

        return [
            'file' => $filePath,
            'thumbnail' => $thumbnailPath,
            'doc_type' => $validated['doc_type'] ?? $lecturer->doc_type,
            'kata_kunci' => $validated['kata_kunci'] ?? $lecturer->kata_kunci,
            'keyword' => $validated['keyword'] ?? $lecturer->keyword,
            'youtube_link' => $lecturer->youtube_link,
        ];
    }

    private function isFileToVideoChange(string $oldType, string $newType): bool
    {
        return $oldType === 'file' && $newType === 'video';
    }

    private function isVideoToFileChange(string $oldType, string $newType): bool
    {
        return $oldType === 'video' && $newType === 'file';
    }
}
