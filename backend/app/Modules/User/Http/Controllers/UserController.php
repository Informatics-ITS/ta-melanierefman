<?php

namespace Modules\User\Http\Controllers;

use Modules\User\Models\User;
use Modules\User\Services\UserService;
use Modules\User\Http\Requests\StoreUserRequest;
use Modules\User\Http\Requests\UpdateUserRequest;

use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    // Read
    public function index(): JsonResponse
    {
        $users = User::all();
        return response()->json($users);
    }

    // Create
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->makeHidden(['password'])
        ], 201);
    }

    // Read by id
    public function show($id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    // Update
    public function update(UpdateUserRequest $request, $id): JsonResponse
    {
        $result = $this->userService->update($id, $request->validated(), $request);

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error'], 'errors' => $result['errors'] ?? null], $result['status']);
        }

        return response()->json([
            'message' => 'User has been successfully updated',
            'user' => $result['user']->makeHidden(['password']),
        ], 200);
    }

    // Delete
    public function destroy($id): JsonResponse
    {
        $result = $this->userService->delete($id);

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], $result['status']);
        }

        return response()->json(['message' => 'User deleted successfully']);
    }
}
