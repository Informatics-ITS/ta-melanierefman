<?php

namespace Modules\About\Http\Controllers;

use Modules\About\Models\About;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AboutController extends Controller
{
    // Read
    public function show(): JsonResponse
    {
        $about = About::with(['documentation'])->first();
        return response()->json([
            'message' => 'About retrieved successfully',
            'about' => $about,
        ]);
    }

    // Update
    public function update(Request $request): JsonResponse
    {
        $about = About::first();

        if (!$about) {
            return response()->json(['message' => 'About not found'], 404);
        }

        $validated = $request->validate([
            'tentang' => ['sometimes', 'string'],
            'about' => ['sometimes', 'string'],
            'tujuan' => ['sometimes', 'string'],
            'purpose' => ['sometimes', 'string'],
            'address' => ['sometimes', 'string'],
            'phone' => ['sometimes', 'string', 'max:15'],
            'email' => ['sometimes', 'email', 'unique:about,email,' . $about->id],
        ]);

        $about->update($validated);
        $about->save();

        return response()->json([
            'message' => 'About updated successfully',
            'about' => $about,
        ]);
    }

    // Delete
    public function destroy(): JsonResponse
    {
        return response()->json(['message' => 'Data cannot be deleted'], 403);
    }
}
