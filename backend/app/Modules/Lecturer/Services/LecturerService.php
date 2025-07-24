<?php

namespace Modules\Lecturer\Services;

use Modules\Lecturer\Models\Lecturer;
use Modules\Lecturer\Services\LecturerCrudService;
use Modules\Lecturer\Services\LecturerFileService;
use Modules\Lecturer\Services\LecturerValidationService;
use Illuminate\Http\Request;

class LecturerService
{
    protected LecturerCrudService $crudService;
    protected LecturerFileService $fileService;
    protected LecturerValidationService $validationService;

    public function __construct(
        LecturerCrudService $crudService,
        LecturerFileService $fileService,
        LecturerValidationService $validationService
    ) {
        $this->crudService = $crudService;
        $this->fileService = $fileService;
        $this->validationService = $validationService;
    }

    public function create(array $validated): Lecturer
    {
        return $this->crudService->create($validated);
    }

    public function update(int $id, array $validated, Request $request): array
    {
        return $this->crudService->update($id, $validated, $request);
    }

    public function delete(int $id): void
    {
        $this->crudService->delete($id);
    }
}
