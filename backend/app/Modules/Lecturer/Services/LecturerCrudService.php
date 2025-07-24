<?php

namespace Modules\Lecturer\Services;

use Modules\Lecturer\Models\Lecturer;
use Modules\Lecturer\Services\LecturerFileService;
use Modules\Lecturer\Services\LecturerValidationService;
use Modules\Lecturer\Services\LecturerTypeHandlerService;
use Illuminate\Http\Request;

class LecturerCrudService
{
    protected LecturerFileService $fileService;
    protected LecturerValidationService $validationService;
    protected LecturerTypeHandlerService $typeHandler;

    public function __construct(
        LecturerFileService $fileService,
        LecturerValidationService $validationService,
        LecturerTypeHandlerService $typeHandler
    ) {
        $this->fileService = $fileService;
        $this->validationService = $validationService;
        $this->typeHandler = $typeHandler;
    }

    public function create(array $validated): Lecturer
    {
        $createData = $this->prepareCreateData($validated);
        return Lecturer::create($createData);
    }

    public function update(int $id, array $validated, Request $request): array
    {
        $lecturer = Lecturer::find($id);

        if (!$lecturer) {
            return ['error' => 'Material not found', 'status' => 404];
        }

        $updateData = $this->prepareUpdateData($lecturer, $validated, $request);

        $validation = $this->validationService->validateUpdate($updateData);
        if (!$validation['valid']) {
            return ['error' => $validation['message'], 'status' => 422];
        }

        $lecturer->update($updateData);
        return ['data' => $lecturer];
    }

    public function delete(int $id): void
    {
        $lecturer = Lecturer::findOrFail($id);
        $this->fileService->deleteFiles($lecturer->file, $lecturer->thumbnail);
        $lecturer->delete();
    }

    private function prepareCreateData(array $validated): array
    {
        $filePath = $this->fileService->handleFileUpload($validated, 'lecturers');
        $thumbnailPath = $this->fileService->handleThumbnailUpload($validated, 'lecturers/thumbnails');

        return [
            'user_id' => $validated['user_id'],
            'judul' => $validated['judul'] ?? null,
            'title' => $validated['title'] ?? null,
            'type' => $validated['type'] ?? null,
            'doc_type' => $validated['doc_type'] ?? null,
            'thumbnail' => $thumbnailPath,
            'file' => $filePath,
            'youtube_link' => $validated['youtube_link'] ?? null,
            'kata_kunci' => $validated['kata_kunci'] ?? null,
            'keyword' => $validated['keyword'] ?? null,
        ];
    }

    private function prepareUpdateData(Lecturer $lecturer, array $validated, Request $request): array
    {
        $newType = $validated['type'] ?? $lecturer->type;
        $oldType = $lecturer->type;

        $updateData = $this->getBaseUpdateData($lecturer, $validated);
        $updateData['type'] = $newType;

        $typeSpecificData = $this->typeHandler->handleTypeChange(
            $lecturer,
            $oldType,
            $newType,
            $validated,
            $request
        );

        return array_merge($updateData, $typeSpecificData);
    }

    private function getBaseUpdateData(Lecturer $lecturer, array $validated): array
    {
        return [
            'judul' => $validated['judul'] ?? $lecturer->judul,
            'title' => $validated['title'] ?? $lecturer->title,
        ];
    }
}
