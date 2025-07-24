<?php

namespace Modules\Publication\Services;

use Modules\Research\Models\Research;
use Modules\Publication\Models\Publication;
use Illuminate\Support\Collection;

class PublicationReaderService
{
    public function getAllPublications(): Collection
    {
        return Publication::all();
    }

    public function getPublicationsByYear(int $year): Collection
    {
        return Publication::where('year', $year)->get();
    }

    public function getAvailableResearches(): Collection
    {
        return Research::doesntHave('publication')->get();
    }

    public function getResearchOptions(?int $publicationId = null): Collection
    {
        $selectedResearch = null;

        if ($publicationId) {
            $publication = Publication::find($publicationId);
            if ($publication) {
                $selectedResearch = Research::find($publication->research_id);
            }
        }

        $availableResearches = Research::doesntHave('publication')->get();

        return $selectedResearch
            ? collect([$selectedResearch])->merge($availableResearches)->filter()
            : $availableResearches;
    }

    public function getPublicationById(int $id): ?Publication
    {
        return Publication::find($id);
    }
}
