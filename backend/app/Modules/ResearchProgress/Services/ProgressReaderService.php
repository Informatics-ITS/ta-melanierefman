<?php

namespace Modules\ResearchProgress\Services;

use Modules\Research\Models\Research;
use Modules\ResearchProgress\Models\ResearchProgress;
use Modules\ResearchProgress\Models\ProgressImage;
use Modules\ResearchProgress\Models\ProgressVideo;
use Modules\ResearchProgress\Models\ProgressMap;
use Modules\ResearchProgress\Models\TextEditor;

class ProgressReaderService
{
    public function getResearchWithProgress($researchId)
    {
        return Research::with([
            'research_progress.progress_images',
            'research_progress.progress_videos',
            'research_progress.text_editors',
            'research_progress.progress_maps'
        ])->find($researchId);
    }

    public function getProgressBySlug($title, $progressTitle)
    {
        $research = $this->findResearchByTitle($title);

        if (!$research) {
            return null;
        }

        $progressResearch = $this->findProgressByTitle($research->id, $progressTitle);

        if (!$progressResearch) {
            return null;
        }

        return $this->buildProgressResponse($progressResearch);
    }

    public function getProgressById($researchId, $progressId)
    {
        $research = Research::find($researchId);

        if (!$research) {
            return null;
        }

        $progressResearch = ResearchProgress::where('id', $progressId)
            ->where('research_id', $research->id)
            ->first();

        if (!$progressResearch) {
            return null;
        }

        return [
            'id' => $progressResearch->id,
            'judul_progres' => $progressResearch->judul_progres,
            'title_progress' => $progressResearch->title_progress,
            'deskripsi' => $progressResearch->deskripsi,
            'description' => $progressResearch->description,
            'progress_videos' => ProgressVideo::where('progress_research_id', $progressResearch->id)->get(),
            'text_editors' => TextEditor::where('progress_research_id', $progressResearch->id)->get(),
            'progress_images' => ProgressImage::where('progress_research_id', $progressResearch->id)->get(),
            'progress_maps' => ProgressMap::where('progress_research_id', $progressResearch->id)->get(),
        ];
    }

    private function findResearchByTitle($title)
    {
        return Research::whereRaw("LOWER(REPLACE(judul, ' ', '+')) = ?", [strtolower($title)])
            ->orWhereRaw("LOWER(REPLACE(title, ' ', '+')) = ?", [strtolower($title)])
            ->first();
    }

    private function findProgressByTitle($researchId, $progressTitle)
    {
        return ResearchProgress::where('research_id', $researchId)
            ->where(function ($query) use ($progressTitle) {
                $query->whereRaw("LOWER(REPLACE(judul_progres, ' ', '+')) = ?", [strtolower($progressTitle)])
                    ->orWhereRaw("LOWER(REPLACE(title_progress, ' ', '+')) = ?", [strtolower($progressTitle)]);
            })
            ->first();
    }

    private function buildProgressResponse($progressResearch)
    {
        $progressData = collect([
            [
                'id' => $progressResearch->id,
                'judul_progres' => $progressResearch->judul_progres,
                'title_progress' => $progressResearch->title_progress,
                'deskripsi' => $progressResearch->deskripsi,
                'description' => $progressResearch->description,
            ]
        ]);

        $videos = ProgressVideo::where('progress_research_id', $progressResearch->id)->get();
        $textEditors = TextEditor::where('progress_research_id', $progressResearch->id)->get();
        $images = ProgressImage::where('progress_research_id', $progressResearch->id)->get();
        $maps = ProgressMap::where('progress_research_id', $progressResearch->id)->get();

        return $progressData
            ->merge($videos)
            ->merge($textEditors)
            ->merge($images)
            ->merge($maps)
            ->sortBy('index_order')
            ->values();
    }
}
