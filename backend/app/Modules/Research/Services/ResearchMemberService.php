<?php

namespace Modules\Research\Services;

use Modules\Research\Models\Research;

class ResearchMemberService
{
    public function attachMembers(Research $research, array $data)
    {
        $research->members()->attach($data['coordinator_id'], ['is_coor' => true]);

        if (!empty($data['member_ids'])) {
            $members = array_diff($data['member_ids'], [$data['coordinator_id']]);
            if (!empty($members)) {
                $research->members()->attach($members, ['is_coor' => false]);
            }
        }
    }

    public function updateMembers(Research $research, array $data)
    {
        $research->members()->detach();

        $coordinatorId = $data['coordinator_id'] ?? $this->getCurrentCoordinatorId($research);

        if ($coordinatorId) {
            $research->members()->attach($coordinatorId, ['is_coor' => true]);
        }

        $memberIds = $data['member_ids'] ?? $this->getCurrentMemberIds($research);
        $members = array_diff($memberIds, [$coordinatorId]);

        if (!empty($members)) {
            $research->members()->attach($members, ['is_coor' => false]);
        }
    }

    public function getMembersByRole(Research $research, bool $isCoordinator = true)
    {
        return $research->members()->wherePivot('is_coor', $isCoordinator)->get();
    }

    public function getCoordinator(Research $research)
    {
        return $research->members()->wherePivot('is_coor', true)->first();
    }

    public function getRegularMembers(Research $research)
    {
        return $research->members()->wherePivot('is_coor', false)->get();
    }

    private function getCurrentCoordinatorId(Research $research)
    {
        return $research->members()->wherePivot('is_coor', true)->first()?->id;
    }

    private function getCurrentMemberIds(Research $research)
    {
        return $research->members()
            ->wherePivot('is_coor', false)
            ->select('members.id')
            ->pluck('id')
            ->toArray();
    }
}
