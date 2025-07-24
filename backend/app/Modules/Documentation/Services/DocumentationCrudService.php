<?php

namespace Modules\Documentation\Services;

use Modules\Documentation\Models\Documentation;
use Modules\Documentation\Services\FileUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentationCrudService
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    public function getById(int $id): ?Documentation
    {
        return Documentation::with('research')->find($id);
    }

    public function create(array $data): Documentation
    {
        $createData = $this->prepareCreateData($data);
        $documentation = Documentation::create($createData);

        if (isset($data['research_id'])) {
            $this->attachResearch($documentation, $data['research_id']);
        }

        return $documentation;
    }

    public function update(int $id, array $data): ?Documentation
    {
        $documentation = Documentation::find($id);

        if (!$documentation) {
            return null;
        }

        $updateData = $this->prepareUpdateData($data, $documentation);
        $documentation->update($updateData);

        if (isset($data['research_id'])) {
            $this->syncResearch($documentation, $data['research_id']);
        }

        return $documentation;
    }

    public function delete(int $id): bool
    {
        $documentation = Documentation::find($id);

        if (!$documentation) {
            return false;
        }

        $this->deleteFile($documentation->image);
        return $documentation->delete();
    }

    public function deleteByResearch(int $id): bool
    {
        $documentation = Documentation::find($id);

        if (!$documentation) {
            return false;
        }

        $documentation->research()->detach();
        $this->deleteFile($documentation->image);

        return $documentation->delete();
    }

    private function prepareCreateData(array $data): array
    {
        $filePath = null;
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $filePath = $this->fileUploadService->uploadImage($data['image']);
        }

        return [
            'judul' => $data['judul'] ?? null,
            'title' => $data['title'] ?? null,
            'type' => $data['type'],
            'image' => $filePath,
            'youtube_link' => $data['youtube_link'] ?? null,
            'keterangan' => $data['keterangan'] ?? null,
            'caption' => $data['caption'] ?? null,
        ];
    }

    private function prepareUpdateData(array $data, Documentation $documentation): array
    {
        $filePath = $documentation->image;

        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $this->deleteFile($documentation->image);
            $filePath = $this->fileUploadService->uploadImage($data['image']);
        }

        return [
            'judul' => $data['judul'] ?? $documentation->judul,
            'title' => $data['title'] ?? $documentation->title,
            'type' => $data['type'] ?? $documentation->type,
            'image' => $filePath,
            'youtube_link' => $data['youtube_link'] ?? $documentation->youtube_link,
            'keterangan' => $data['keterangan'] ?? $documentation->keterangan,
            'caption' => $data['caption'] ?? $documentation->caption,
        ];
    }

    private function attachResearch(Documentation $documentation, int $researchId): void
    {
        $documentation->research()->attach($researchId, ['is_thumbnail' => false]);
    }

    private function syncResearch(Documentation $documentation, int $researchId): void
    {
        $documentation->research()->sync([
            $researchId => ['is_thumbnail' => false]
        ]);
    }

    private function deleteFile(?string $filePath): void
    {
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }
    }
}
