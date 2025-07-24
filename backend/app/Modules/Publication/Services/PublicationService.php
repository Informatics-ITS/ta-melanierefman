<?php

namespace Modules\Publication\Services;

use Modules\Publication\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class PublicationService
{
    protected $publicationReaderService;
    protected $publicationCrudService;
    protected $publicationValidationService;

    public function __construct(
        PublicationReaderService $publicationReaderService,
        PublicationCrudService $publicationCrudService,
        PublicationValidationService $publicationValidationService
    ) {
        $this->publicationReaderService = $publicationReaderService;
        $this->publicationCrudService = $publicationCrudService;
        $this->publicationValidationService = $publicationValidationService;
    }

    public function getAllPublications(): Collection
    {
        return $this->publicationReaderService->getAllPublications();
    }

    public function getPublicationsByYear(int $year): Collection
    {
        return $this->publicationReaderService->getPublicationsByYear($year);
    }

    public function getAvailableResearches(): Collection
    {
        return $this->publicationReaderService->getAvailableResearches();
    }

    public function getResearchOptions(?int $publicationId = null): Collection
    {
        return $this->publicationReaderService->getResearchOptions($publicationId);
    }

    public function getPublicationById(int $id): ?Publication
    {
        return $this->publicationReaderService->getPublicationById($id);
    }

    public function createPublication(array $data, Request $request): Publication
    {
        return $this->publicationCrudService->createPublication($data, $request);
    }

    public function updatePublication(int $id, array $data, Request $request): ?Publication
    {
        return $this->publicationCrudService->updatePublication($id, $data, $request);
    }

    public function deletePublication(int $id): bool
    {
        return $this->publicationCrudService->deletePublication($id);
    }

    public function validateYear(string $year): bool
    {
        return $this->publicationValidationService->validateYear($year);
    }
}
