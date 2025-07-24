<?php

namespace Modules\Documentation\Services;

use Modules\Documentation\Models\Documentation;
use Modules\Documentation\Services\DocumentationImageService;
use Modules\Documentation\Services\DocumentationVideoService;
use Modules\Documentation\Services\DocumentationAboutService;
use Modules\Documentation\Services\DocumentationCrudService;
use Illuminate\Database\Eloquent\Collection;

class DocumentationService
{
    protected DocumentationImageService $imageService;
    protected DocumentationVideoService $videoService;
    protected DocumentationAboutService $aboutService;
    protected DocumentationCrudService $crudService;

    public function __construct(
        DocumentationImageService $imageService,
        DocumentationVideoService $videoService,
        DocumentationAboutService $aboutService,
        DocumentationCrudService $crudService
    ) {
        $this->imageService = $imageService;
        $this->videoService = $videoService;
        $this->aboutService = $aboutService;
        $this->crudService = $crudService;
    }

    public function getById(int $id): ?Documentation
    {
        return $this->crudService->getById($id);
    }

    public function create(array $data): Documentation
    {
        return $this->crudService->create($data);
    }

    public function update(int $id, array $data): ?Documentation
    {
        return $this->crudService->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->crudService->delete($id);
    }

    public function deleteByResearch(int $id): bool
    {
        return $this->crudService->deleteByResearch($id);
    }

    public function getAllImages(): Collection
    {
        return $this->imageService->getAllImages();
    }

    public function getImagesByResearch(int $researchId): Collection
    {
        return $this->imageService->getImagesByResearch($researchId);
    }

    public function createImageDetails(array $data): Documentation
    {
        return $this->imageService->createImageDetails($data);
    }

    public function updateImageDetails(int $documentationId, array $data): ?Documentation
    {
        return $this->imageService->updateImageDetails($documentationId, $data);
    }

    public function deleteImage(int $documentationId): bool
    {
        return $this->imageService->deleteImage($documentationId);
    }

    public function getAllVideos(): Collection
    {
        return $this->videoService->getAllVideos();
    }

    public function getVideosByResearch(int $researchId): Collection
    {
        return $this->videoService->getVideosByResearch($researchId);
    }

    public function getAboutDocumentation(): ?Collection
    {
        return $this->aboutService->getAboutDocumentation();
    }

    public function createAboutDocumentation(array $data): ?Documentation
    {
        return $this->aboutService->createAboutDocumentation($data);
    }

    public function updateAboutDocumentation(int $documentationId, array $data): ?Documentation
    {
        return $this->aboutService->updateAboutDocumentation($documentationId, $data);
    }
}
