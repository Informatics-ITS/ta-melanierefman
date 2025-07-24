<?php

namespace Modules\Lecturer\Http\Controllers;

use Modules\Lecturer\Models\Lecturer;
use Modules\Lecturer\Services\LecturerService;
use Modules\Lecturer\Http\Requests\StoreLecturerRequest;
use Modules\Lecturer\Http\Requests\UpdateLecturerRequest;

use Illuminate\Http\JsonResponse;

class LecturerController extends Controller
{
    protected $lecturerService;

    public function __construct(LecturerService $lecturerService)
    {
        $this->lecturerService = $lecturerService;
    }

    // Read
    public function index(): JsonResponse
    {
        $lecturers = Lecturer::all();
        return response()->json($lecturers, 200);
    }

    // Read by id
    public function show($id): JsonResponse
    {
        $lecturer = Lecturer::findOrFail($id);
        return response()->json($lecturer);
    }

    // Create
    public function store(StoreLecturerRequest $request): JsonResponse
    {
        $lecturer = $this->lecturerService->create($request->validated());

        return response()->json([
            'message' => 'Material created successfully',
            'data' => $lecturer,
        ], 201);
    }

    // Update
    public function update(UpdateLecturerRequest $request, $id): JsonResponse
    {
        $result = $this->lecturerService->update($id, $request->validated(), $request);

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], $result['status']);
        }

        return response()->json([
            'message' => 'Material updated successfully',
            'data' => $result['data'],
        ], 200);
    }

    // Delete
    public function destroy($id): JsonResponse
    {
        $this->lecturerService->delete($id);

        return response()->json([
            'message' => 'Material deleted successfully',
        ], 200);
    }
}
