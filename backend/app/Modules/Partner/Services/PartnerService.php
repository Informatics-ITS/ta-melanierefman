<?php

namespace Modules\Partner\Services;

use Modules\Partner\Models\Partner;

class PartnerService
{
    public function getAllPartners()
    {
        return Partner::with(['partners_member', 'research'])->get();
    }

    public function getPartnerById($id)
    {
        return Partner::with('research', 'partners_member')->find($id);
    }

    public function createPartner(array $data)
    {
        $partner = Partner::create([
            'name' => $data['name'],
        ]);

        $partner->research()->sync($data['research_id']);

        $members = [];
        foreach ($data['members'] as $memberData) {
            $members[] = $partner->partners_member()->create($memberData);
        }

        return [
            'partner' => $partner,
            'members' => $members
        ];
    }

    public function updatePartner($id, array $data)
    {
        $partner = Partner::findOrFail($id);

        if (isset($data['name'])) {
            $partner->update(['name' => $data['name']]);
        }

        if (isset($data['research_id'])) {
            $partner->research()->sync($data['research_id']);
        }

        $partnerResearch = $partner->research()->withPivot('created_at', 'updated_at')->get();

        $updatedMembers = [];

        if (isset($data['partners_member'])) {
            $updatedMembers = $this->updatePartnerMembers($partner, $data['partners_member']);
        }

        return [
            'partner' => $partner,
            'research' => $partnerResearch,
            'partners_member' => $updatedMembers
        ];
    }

    public function deletePartner($id)
    {
        $partner = Partner::find($id);

        if (!$partner) {
            return false;
        }

        $partner->research()->detach();
        $partner->delete();

        return true;
    }

    private function updatePartnerMembers(Partner $partner, array $membersData)
    {
        $existingMemberIds = $partner->partners_member->pluck('id')->toArray();
        $updatedMembers = [];

        foreach ($membersData as $memberData) {
            if (isset($memberData['id'])) {
                $member = $partner->partners_member()->find($memberData['id']);
                if ($member) {
                    $member->update(['name' => $memberData['name']]);
                    $updatedMembers[] = $member;
                    $existingMemberIds = array_diff($existingMemberIds, [$memberData['id']]);
                }
            } else {
                $newMember = $partner->partners_member()->create($memberData);
                $updatedMembers[] = $newMember;
            }
        }

        if (!empty($existingMemberIds)) {
            $partner->partners_member()->whereIn('id', $existingMemberIds)->delete();
        }

        return $updatedMembers;
    }
}
