<?php

namespace Modules\Partner\Http\Controllers;

use Modules\Partner\Http\Requests\StorePartnerRequest;
use Modules\Partner\Http\Requests\UpdatePartnerRequest;
use Modules\Partner\Services\PartnerService;

use Illuminate\Http\JsonResponse;

class PartnerController extends Controller
{
    protected $partnerService;

    public function __construct(PartnerService $partnerService)
    {
        $this->partnerService = $partnerService;
    }

    // Read
    public function index(): JsonResponse
    {
        $partners = $this->partnerService->getAllPartners();
        return response()->json($partners, 200);
    }

    // Create
    public function store(StorePartnerRequest $request): JsonResponse
    {
        $result = $this->partnerService->createPartner($request->validated());

        return response()->json([
            'message' => 'Partner and members created successfully',
            'partner' => $result['partner'],
            'members' => $result['members']
        ], 201);
    }

    // Read by id
    public function show($partnerId): JsonResponse
    {
        $partner = $this->partnerService->getPartnerById($partnerId);
        return response()->json($partner, 200);
    }

    // Update
    public function update(UpdatePartnerRequest $request, $id): JsonResponse
    {
        $result = $this->partnerService->updatePartner($id, $request->validated());

        return response()->json([
            'message' => 'Partner and members updated successfully',
            'partner' => $result['partner'],
            'research' => $result['research'],
            'partners_member' => $result['partners_member']
        ], 200);
    }

    // Delete
    public function destroy($partnerId): JsonResponse
    {
        $deleted = $this->partnerService->deletePartner($partnerId);

        if (!$deleted) {
            return response()->json(['message' => 'Partner not found'], 404);
        }

        return response()->json(['message' => 'Partner deleted successfully'], 200);
    }
}
