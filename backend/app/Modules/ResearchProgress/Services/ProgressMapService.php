<?php

namespace Modules\ResearchProgress\Services;

use Modules\ResearchProgress\Models\ProgressMap;

class ProgressMapService
{
    public function createProgressMaps($progressId, array $maps)
    {
        foreach ($maps as $map) {
            ProgressMap::create([
                'progress_research_id' => $progressId,
                'latitude' => $map['latitude'],
                'longitude' => $map['longitude'],
                'zoom' => $map['zoom'],
                'index_order' => $map['index_order'],
            ]);
        }
    }
}
