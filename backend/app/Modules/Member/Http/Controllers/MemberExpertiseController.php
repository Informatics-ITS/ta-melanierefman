<?php

namespace Modules\Member\Http\Controllers;

use Modules\Member\Models\MemberExpertise;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MemberExpertiseController extends Controller
{
    // Read
    public function index(): JsonResponse
    {
        $expertises = MemberExpertise::all();
        return response()->json($expertises, 200);
    }

    // Create
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'keahlian' => 'required|string|max:100',
            'expertise' => 'required|string|max:100',
        ]);

        $expertise = MemberExpertise::create($validated);

        return response()->json([
            'message' => 'Expertise created successfully.',
            'data' => $expertise,
        ], 201);
    }

    // Show by id
    public function show($id): JsonResponse
    {
        $expertise = MemberExpertise::find($id);

        if (!$expertise) {
            return response()->json(['message' => 'Expertise not found.'], 404);
        }

        return response()->json(['data' => $expertise], 200);
    }

    // Update
    public function update(Request $request, $id): JsonResponse
    {
        $expertise = MemberExpertise::find($id);

        if (!$expertise) {
            return response()->json(['message' => 'Expertise not found.'], 404);
        }

        $validated = $request->validate([
            'keahlian' => 'required|string|max:100',
            'expertise' => 'required|string|max:100',
        ]);

        $expertise->update($validated);

        return response()->json([
            'message' => 'Expertise updated successfully.',
            'data' => $expertise,
        ], 200);
    }

    // Delete
    public function destroy($id): JsonResponse
    {
        $expertise = MemberExpertise::find($id);

        if (!$expertise) {
            return response()->json(['message' => 'Expertise not found.'], 404);
        }

        $expertise->delete();

        return response()->json(['message' => 'Expertise deleted successfully.'], 200);
    }
}
