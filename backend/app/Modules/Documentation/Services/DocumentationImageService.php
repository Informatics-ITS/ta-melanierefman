<?php

namespace Modules\Documentation\Services;

use Modules\Documentation\Models\Documentation;
use Modules\Documentation\Services\FileUploadService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentationImageService
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    public function getAllImages(): Collection
    {
        return Documentation::with('research')
            ->whereNotNull('image')
            ->whereNull('youtube_link')
            ->get();
    }

    public function getImagesByResearch(int $researchId): Collection
    {
        return Documentation::with('research')
            ->whereHas('research', function ($query) use ($researchId) {
                $query->where('research_id', $researchId);
            })
            ->whereNotNull('image')
            ->get();
    }

    public function createImageDetails(array $data): Documentation
    {
        $filePath = $this->fileUploadService->uploadImage($data['image'], true);

        $documentation = Documentation::create([
            'image' => $filePath,
            'caption' => $data['caption'] ?? null,
            'keterangan' => $data['keterangan'] ?? null,
            'type' => 'image',
        ]);

        $documentation->research()->attach($data['research_id'], ['is_thumbnail' => true]);

        return $documentation->load('research');
    }

    public function updateImageDetails(int $documentationId, array $data): ?Documentation
    {
        $documentation = Documentation::find($documentationId);

        if (!$documentation) {
            return null;
        }

        $updateData = $this->prepareImageUpdateData($data, $documentation);

        if (!empty($updateData)) {
            $documentation->update($updateData);
        }

        return $documentation;
    }

    public function deleteImage(int $documentationId): bool
    {
        $documentation = Documentation::find($documentationId);

        if (!$documentation) {
            return false;
        }

        $documentation->research()->detach();
        $this->deleteImageFile($documentation->image);

        return $documentation->delete();
    }

    private function prepareImageUpdateData(array $data, Documentation $documentation): array
    {
        $updateData = [];

        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $this->deleteImageFile($documentation->image);
            $updateData['image'] = $this->fileUploadService->uploadImage($data['image'], true);
        }

        if (isset($data['caption'])) {
            $updateData['caption'] = $data['caption'];
        }

        if (isset($data['keterangan'])) {
            $updateData['keterangan'] = $data['keterangan'];
        }

        return $updateData;
    }

    private function deleteImageFile(?string $imagePath): void
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }
}
