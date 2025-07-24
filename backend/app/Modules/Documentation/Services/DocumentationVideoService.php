<?php

namespace Modules\Documentation\Services;

use Modules\Documentation\Models\Documentation;
use Illuminate\Database\Eloquent\Collection;

class DocumentationVideoService
{
    public function getAllVideos(): Collection
    {
        return Documentation::with('research')
            ->whereNotNull('youtube_link')
            ->whereNull('image')
            ->get();
    }

    public function getVideosByResearch(int $researchId): Collection
    {
        return Documentation::with('research')
            ->whereHas('research', function ($query) use ($researchId) {
                $query->where('research_id', $researchId);
            })
            ->whereNotNull('youtube_link')
            ->get();
    }
}
