<?php

namespace Modules\Research\Http\Controllers;

use Modules\Research\Models\Research;
use Modules\Research\Http\Requests\StoreResearchRequest;
use Modules\Research\Http\Requests\UpdateResearchRequest;
use Modules\Research\Services\ResearchService;

use Illuminate\Http\JsonResponse;

class ResearchController extends Controller
{
    protected $researchService;

    public function __construct(ResearchService $researchService)
    {
        $this->researchService = $researchService;
    }

    // Read
    public function index(): JsonResponse
    {
        $research = $this->researchService->getAllResearch();
        return response()->json($research);
    }

    // Get Research by Year
    public function getResearchByYear($year): JsonResponse
    {
        $research = $this->researchService->getResearchByYear($year);
        return response()->json([
            'message' => 'Research retrieved successfully.',
            'data' => $research,
        ]);
    }

    // Create
    public function store(StoreResearchRequest $request): JsonResponse
    {
        $research = $this->researchService->createResearch(
            $request->validated(),
            $request->hasFile('images') ? $request->only(['images']) : null
        );

        return response()->json([
            'message' => 'Research created successfully',
            'research' => $research,
        ], 201);
    }

    // Show by ID
    public function show($id): JsonResponse
    {
        $research = $this->researchService->getResearchById($id);
        return response()->json($research);
    }

    // Update
    public function update(UpdateResearchRequest $request, Research $research): JsonResponse
    {
        $updatedResearch = $this->researchService->updateResearch($research, $request->validated());

        return response()->json([
            'message' => 'Research updated successfully',
            'research' => $updatedResearch,
        ], 200);
    }

    // Delete
    public function destroy($id): JsonResponse
    {
        $deleted = $this->researchService->deleteResearch($id);

        if (!$deleted) {
            return response()->json(['message' => 'Research not found'], 404);
        }

        return response()->json(['message' => 'Research deleted successfully']);
    }
}
