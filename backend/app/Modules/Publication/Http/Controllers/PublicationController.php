<?php

namespace Modules\Publication\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Publication\Http\Requests\StorePublicationRequest;
use Modules\Publication\Http\Requests\UpdatePublicationRequest;
use Modules\Publication\Services\PublicationService;

class PublicationController extends Controller
{
    public function __construct(
        private PublicationService $publicationService
    ) {}

    // Read
    public function index(): JsonResponse
    {
        $publications = $this->publicationService->getAllPublications();

        return response()->json($publications, 200);
    }

    // Read by Year
    public function getPublicationsByYear($year): JsonResponse
    {
        if (!$this->publicationService->validateYear($year)) {
            return response()->json([
                'message' => 'Invalid year parameter. It must be a valid year.'
            ], 400);
        }

        $publications = $this->publicationService->getPublicationsByYear((int) $year);

        return response()->json([
            'message' => 'Publications retrieved successfully.',
            'data' => $publications
        ], 200);
    }

    // Read by Research
    public function getAvailableResearches(): JsonResponse
    {
        $researches = $this->publicationService->getAvailableResearches();

        return response()->json($researches);
    }

    public function getResearches(?int $id = null): JsonResponse
    {
        try {
            $researchOptions = $this->publicationService->getResearchOptions($id);

            return response()->json($researchOptions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Publication not found'], 404);
        }
    }

    // Create
    public function store(StorePublicationRequest $request): JsonResponse
    {
        try {
            $publication = $this->publicationService->createPublication(
                $request->validated(),
                $request
            );

            return response()->json([
                'message' => 'Publication successfully created',
                'data' => $publication
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // Read by ID
    public function show($id): JsonResponse
    {
        $publication = $this->publicationService->getPublicationById((int) $id);

        if (!$publication) {
            return response()->json(['message' => 'Publication not found'], 404);
        }

        return response()->json($publication, 200);
    }

    // Update
    public function update(UpdatePublicationRequest $request, $id): JsonResponse
    {
        $publication = $this->publicationService->updatePublication(
            (int) $id,
            $request->validated(),
            $request
        );

        if (!$publication) {
            return response()->json(['message' => 'Publication not found'], 404);
        }

        return response()->json([
            'message' => 'Publication successfully updated',
            'data' => $publication
        ], 200);
    }

    // Delete
    public function destroy($id): JsonResponse
    {
        $deleted = $this->publicationService->deletePublication((int) $id);

        if (!$deleted) {
            return response()->json(['message' => 'Publication not found'], 404);
        }

        return response()->json(['message' => 'Publication deleted successfully']);
    }
}
