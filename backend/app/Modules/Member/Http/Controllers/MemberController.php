<?php

namespace Modules\Member\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Modules\Member\Models\Member;
use Modules\Member\Models\MemberExpertise;
use Modules\Member\Http\Requests\StoreMemberRequest;
use Modules\Member\Http\Requests\UpdateMemberRequest;
use Modules\Member\Services\MemberService;

class MemberController extends Controller
{
    protected $memberService;

    public function __construct(MemberService $memberService)
    {
        $this->memberService = $memberService;
    }

    // Read
    public function index(): JsonResponse
    {
        $members = $this->memberService->getAllMembers();
        return response()->json($members);
    }

    // Create
    public function store(StoreMemberRequest $request): JsonResponse
    {
        if ($request->has('expertise_ids') && !empty($request->expertise_ids)) {
            $existingIds = MemberExpertise::whereIn('id', $request->expertise_ids)->pluck('id')->toArray();
            $missingIds = array_diff($request->expertise_ids, $existingIds);

            if (!empty($missingIds)) {
                return response()->json([
                    'message' => 'Some expertise IDs do not exist',
                    'missing_ids' => $missingIds
                ], 422);
            }
        }

        $member = $this->memberService->createMember(
            $request->validated(),
            $request->hasFile('image') ? $request->file('image') : null
        );

        return response()->json([
            'message' => 'Member created successfully',
            'data' => $member
        ], 201);
    }

    // Show by id
    public function show($id): JsonResponse
    {
        $member = $this->memberService->getMemberById($id);
        return response()->json($member);
    }

    // Update
    public function update(UpdateMemberRequest $request, Member $member): JsonResponse
    {
        if ($request->has('expertise_ids') && !empty($request->expertise_ids)) {
            $existingIds = MemberExpertise::whereIn('id', $request->expertise_ids)->pluck('id')->toArray();
            $missingIds = array_diff($request->expertise_ids, $existingIds);

            if (!empty($missingIds)) {
                return response()->json([
                    'message' => 'Some expertise IDs do not exist',
                    'missing_ids' => $missingIds
                ], 422);
            }
        }

        $updatedMember = $this->memberService->updateMember(
            $member,
            $request->validated(),
            $request->hasFile('image') ? $request->file('image') : null
        );

        return response()->json([
            'message' => 'Member updated successfully',
            'member' => $updatedMember
        ], 200);
    }

    // Delete
    public function destroy($id): JsonResponse
    {
        $deleted = $this->memberService->deleteMember($id);

        if (!$deleted) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        return response()->json(['message' => 'Member deleted successfully']);
    }
}
