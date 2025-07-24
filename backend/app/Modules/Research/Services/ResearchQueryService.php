<?php

namespace Modules\Research\Services;

use Modules\Research\Models\Research;

class ResearchQueryService
{
    private function getBaseRelations()
    {
        return [
            'research_progress.progress_videos',
            'research_progress.progress_images',
            'research_progress.text_editors',
            'research_progress.progress_maps',
            'publication',
            'partners',
            'partners.partners_member',
            'documentations',
            'members'
        ];
    }

    private function getSimpleRelations()
    {
        return [
            'research_progress',
            'publication',
            'partners',
            'documentations'
        ];
    }

    public function getAllWithRelations()
    {
        return Research::with(array_merge($this->getBaseRelations(), ['documentations.research']))
            ->get();
    }

    public function getByYear($year)
    {
        return Research::with($this->getSimpleRelations())
            ->whereYear('start_date', $year)
            ->orWhereYear('end_date', $year)
            ->get();
    }

    public function getByIdWithRelations($id)
    {
        return Research::with($this->getBaseRelations())->find($id);
    }

    public function getById($id)
    {
        return Research::find($id);
    }

    public function getByIdWithCustomRelations($id, array $relations)
    {
        return Research::with($relations)->find($id);
    }
}
