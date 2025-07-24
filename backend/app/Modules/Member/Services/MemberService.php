<?php

namespace Modules\Member\Services;

use Modules\Member\Models\Member;
use Modules\Member\Models\MemberExpertise;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MemberService
{
    public function getAllMembers()
    {
        return Member::with(['members_education', 'members_expertise', 'research'])->get();
    }

    public function getMemberById($id)
    {
        return Member::with(['members_education', 'members_expertise'])->find($id);
    }

    public function createMember(array $data, $imageFile = null)
    {
        DB::beginTransaction();

        $member = Member::create($data);

        if (!empty($data['expertise_ids'])) {

            $existingIds = MemberExpertise::whereIn('id', $data['expertise_ids'])->pluck('id')->toArray();
            $validIds = array_intersect($data['expertise_ids'], $existingIds);

            if (!empty($validIds)) $member->members_expertise()->attach($validIds);
        }

        if (!empty($data['educations'])) $this->createEducations($member, $data['educations']);

        if ($imageFile) $this->handleImageUpload($member, $imageFile);

        DB::commit();

        return $member->fresh(['members_education', 'members_expertise']);
    }

    public function updateMember(Member $member, array $data, $imageFile = null)
    {
        DB::beginTransaction();

        $member->members_expertise()->detach();
        $member->members_education()->delete();

        $member->update($data);

        if (isset($data['name']) && $member->user) {
            $member->user->update([
                'name' => $data['name'],
            ]);
        }

        if (!empty($data['expertise_ids'])) {
            $existingIds = MemberExpertise::whereIn('id', $data['expertise_ids'])->pluck('id')->toArray();
            $validIds = array_intersect($data['expertise_ids'], $existingIds);

            if (!empty($validIds)) {
                $member->members_expertise()->attach($validIds);
            }
        }

        if (!empty($data['educations'])) $this->createEducations($member, $data['educations']);

        if ($imageFile) $this->handleImageUpload($member, $imageFile, true);

        DB::commit();

        return $member->fresh(['members_education', 'members_expertise']);
    }

    public function deleteMember($id)
    {
        DB::beginTransaction();

        $member = Member::find($id);

        if (!$member) {
            return false;
        }

        if ($member->image && Storage::disk('public')->exists($member->image)) {
            Storage::disk('public')->delete($member->image);
        }

        $member->members_education()->delete();
        $member->members_expertise()->detach();

        $member->delete();

        DB::commit();

        return true;
    }

    private function createEducations(Member $member, array $educations)
    {
        foreach ($educations as $education) {
            $filteredEducation = array_filter($education, function ($value) {
                return !empty($value);
            });

            if (!empty($filteredEducation)) {
                $member->members_education()->create($education);
            }
        }
    }

    private function handleImageUpload(Member $member, $imageFile, $deleteExisting = false)
    {
        if ($deleteExisting && $member->image) {
            Storage::disk('public')->delete($member->image);
        }

        $filePath = $imageFile->storeAs(
            'documentation/members',
            now()->format('YmdHis') . '.' . $imageFile->getClientOriginalExtension(),
            'public'
        );

        $member->update(['image' => $filePath]);
    }
}
