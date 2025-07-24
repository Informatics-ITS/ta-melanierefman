<?php

namespace Modules\Documentation\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Documentation\Services\DocumentationService;
use Modules\Documentation\Http\Requests\StoreDocumentationRequest;
use Modules\Documentation\Http\Requests\UpdateDocumentationRequest;
use Modules\Documentation\Http\Requests\StoreImageDetailsRequest;
use Modules\Documentation\Http\Requests\UpdateImageDetailsRequest;
use Modules\Documentation\Http\Requests\StoreImageAboutRequest;
use Modules\Documentation\Http\Requests\UpdateImageAboutRequest;

class DocumentationController extends Controller
{
    public function __construct(
        private DocumentationService $documentationService
    ) {}

    // Read
    public function show(int $id): JsonResponse
    {
        $documentation = $this->documentationService->getById($id);

        if (!$documentation) {
            return response()->json(['message' => 'Documentation not found'], 404);
        }

        return response()->json($documentation, 200);
    }

    public function indexImage(): JsonResponse
    {
        $images = $this->documentationService->getAllImages();
        return response()->json($images, 200);
    }

    public function indexVideo(): JsonResponse
    {
        $videos = $this->documentationService->getAllVideos();
        return response()->json($videos, 200);
    }

    public function indexImageByResearch(int $researchId): JsonResponse
    {
        $images = $this->documentationService->getImagesByResearch($researchId);
        return response()->json($images, 200);
    }

    public function indexVideoByResearch(int $researchId): JsonResponse
    {
        $videos = $this->documentationService->getVideosByResearch($researchId);
        return response()->json($videos, 200);
    }

    // Create
    public function store(StoreDocumentationRequest $request): JsonResponse
    {
        $documentation = $this->documentationService->create($request->validated());

        return response()->json([
            'message' => 'Documentation created successfully',
            'data' => $documentation,
        ], 201);
    }

    // Update
    public function update(UpdateDocumentationRequest $request, int $id): JsonResponse
    {
        $documentation = $this->documentationService->update($id, $request->validated());

        if (!$documentation) {
            return response()->json(['message' => 'Documentation not found'], 404);
        }

        return response()->json([
            'message' => 'Documentation updated successfully',
            'data' => $documentation,
        ], 200);
    }

    // Delete
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->documentationService->delete($id);

        if (!$deleted) {
            return response()->json(['message' => 'Documentation not found'], 404);
        }

        return response()->json([
            'message' => 'Documentation deleted successfully',
        ], 200);
    }

    public function deleteResearch(int $id): JsonResponse
    {
        $deleted = $this->documentationService->deleteByResearch($id);

        if (!$deleted) {
            return response()->json(['message' => 'Documentation not found'], 404);
        }

        return response()->json([
            'message' => 'Documentation deleted successfully'
        ], 200);
    }

    // Image Details Operations
    public function storeImageDetails(StoreImageDetailsRequest $request): JsonResponse
    {
        $documentation = $this->documentationService->createImageDetails($request->validated());

        return response()->json([
            'message' => 'Thumbnail created successfully',
            'data' => $documentation,
        ], 201);
    }

    public function updateImageDetails(UpdateImageDetailsRequest $request, int $documentationId): JsonResponse
    {
        $documentation = $this->documentationService->updateImageDetails($documentationId, $request->validated());

        if (!$documentation) {
            return response()->json(['message' => 'Documentation not found'], 404);
        }

        return response()->json([
            'message' => 'Documentation updated successfully',
            'data' => $documentation,
        ], 200);
    }

    public function deleteImage(int $documentationId): JsonResponse
    {
        $deleted = $this->documentationService->deleteImage($documentationId);

        if (!$deleted) {
            return response()->json(['message' => 'Documentation not found'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Documentation deleted successfully',
        ], 200);
    }

    // About Operations
    public function viewImageAbout(): JsonResponse
    {
        $documentation = $this->documentationService->getAboutDocumentation();

        if (!$documentation) {
            return response()->json(['message' => 'About data not found'], 404);
        }

        return response()->json($documentation, 200);
    }

    public function storeImageAbout(StoreImageAboutRequest $request): JsonResponse
    {
        $documentation = $this->documentationService->createAboutDocumentation($request->validated());

        if (!$documentation) {
            return response()->json(['message' => 'About data not found'], 404);
        }

        return response()->json([
            'message' => 'Image added to About documentation successfully',
            'data' => $documentation,
        ], 201);
    }

    public function updateImageAbout(UpdateImageAboutRequest $request, int $documentationId): JsonResponse
    {
        $documentation = $this->documentationService->updateAboutDocumentation($documentationId, $request->validated());

        if (!$documentation) {
            return response()->json(['message' => 'Documentation not found'], 404);
        }

        return response()->json([
            'message' => 'Image updated successfully',
            'data' => $documentation,
        ], 200);
    }
}
