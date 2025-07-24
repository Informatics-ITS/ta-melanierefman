<?php

namespace Modules\ResearchProgress\Services;

use Modules\ResearchProgress\Models\ProgressVideo;

class ProgressVideoService
{
    public function createProgressVideos($progressId, array $videos)
    {
        foreach ($videos as $video) {
            ProgressVideo::create([
                'progress_research_id' => $progressId,
                'youtube_link' => $video['youtube_link'],
                'index_order' => $video['index_order'],
            ]);
        }
    }
}
