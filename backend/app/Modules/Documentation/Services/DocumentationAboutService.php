<?php

namespace Modules\Documentation\Services;

use Modules\About\Models\About;
use Modules\Documentation\Models\Documentation;
use Modules\Documentation\Services\FileUploadService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentationAboutService
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    public function getAboutDocumentation(): ?Collection
    {
        $about = About::first();
        return $about ? $about->documentation : null;
    }

    public function createAboutDocumentation(array $data): ?Documentation
    {
        $about = About::first();

        if (!$about) {
            return null;
        }

        $filePath = $this->fileUploadService->uploadImage($data['image'], false, 'about');

        return $about->documentation()->create([
            'image' => $filePath,
            'about_type' => $data['about_type'],
            'keterangan' => $data['keterangan'],
            'caption' => $data['caption'],
        ]);
    }

    public function updateAboutDocumentation(int $documentationId, array $data): ?Documentation
    {
        $documentation = Documentation::find($documentationId);

        if (!$documentation) {
            return null;
        }

        $updateData = $this->prepareAboutUpdateData($data, $documentation);
        $documentation->update($updateData);

        return $documentation;
    }

    private function prepareAboutUpdateData(array $data, Documentation $documentation): array
    {
        $filePath = $documentation->image;

        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $this->deleteAboutFile($documentation->image);
            $filePath = $this->fileUploadService->uploadImage($data['image'], false, 'about');
        }

        return [
            'image' => $filePath,
            'about_type' => $data['about_type'] ?? $documentation->about_type,
            'keterangan' => $data['keterangan'] ?? $documentation->keterangan,
            'caption' => $data['caption'] ?? $documentation->caption,
        ];
    }

    private function deleteAboutFile(?string $filePath): void
    {
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }
    }
}
