<?php

namespace Modules\ResearchProgress\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\ResearchProgress\Http\Requests\StoreResearchProgressRequest;
use Modules\ResearchProgress\Http\Requests\UpdateResearchProgressRequest;
use Modules\ResearchProgress\Services\ResearchProgressService;

class ResearchProgressController extends Controller
{
    public function __construct(
        private ResearchProgressService $researchProgressService
    ) {}

    // Read
    public function index($researchId): JsonResponse
    {
        $research = $this->researchProgressService->getResearchWithProgress($researchId);
        $progress = $research?->research_progress;

        return response()->json($progress, 200);
    }

    // Read by title
    public function show($title, $progressTitle): JsonResponse
    {
        $progress = $this->researchProgressService->getProgressBySlug($title, $progressTitle);

        if (!$progress) {
            return response()->json(['error' => 'Progress not found'], 404);
        }

        return response()->json($progress);
    }

    // Read by ID
    public function showById($researchId, $progressId): JsonResponse
    {
        $progress = $this->researchProgressService->getProgressById($researchId, $progressId);

        if (!$progress) {
            return response()->json(['error' => 'Research or progress not found'], 404);
        }

        return response()->json($progress);
    }

    // Create
    public function store(StoreResearchProgressRequest $request, $researchId): JsonResponse
    {
        $progress = $this->researchProgressService->createProgress(
            $researchId,
            $request->validated(),
            $request
        );

        return response()->json([
            'message' => 'Progress added successfully',
            'progress' => $progress
        ], 201);
    }

    // Update
    public function update(UpdateResearchProgressRequest $request, $researchId, $progressId): JsonResponse
    {
        $progress = $this->researchProgressService->updateProgress(
            $researchId,
            $progressId,
            $request->validated(),
            $request
        );

        return response()->json([
            'message' => 'Progress updated successfully',
            'progress' => $progress,
        ]);
    }

    // Delete
    public function destroy($researchId, $progressId): JsonResponse
    {
        $this->researchProgressService->deleteProgress($researchId, $progressId);

        return response()->json([
            'message' => 'Progress deleted successfully'
        ], 200);
    }
}
