<?php

namespace Modules\ResearchProgress\Services;

use Modules\Research\Models\Research;
use Modules\ResearchProgress\Models\ResearchProgress;
use Modules\ResearchProgress\Models\ProgressImage;
use Modules\ResearchProgress\Models\ProgressVideo;
use Modules\ResearchProgress\Models\ProgressMap;
use Modules\ResearchProgress\Models\TextEditor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProgressWriterService
{
    protected $progressComponentService;

    public function __construct(ProgressComponentService $progressComponentService)
    {
        $this->progressComponentService = $progressComponentService;
    }

    public function createProgress($researchId, array $data, Request $request)
    {
        Research::findOrFail($researchId);

        return DB::transaction(function () use ($data, $researchId, $request) {
            $progress = ResearchProgress::create([
                'research_id' => $researchId,
                'judul_progres' => $data['judul_progres'],
                'title_progress' => $data['title_progress'],
                'deskripsi' => $data['deskripsi'],
                'description' => $data['description'],
            ]);

            $this->progressComponentService->createProgressVideos($progress->id, $data['videos'] ?? []);
            $this->progressComponentService->createTextEditors($progress->id, $data['text_editors'] ?? []);
            $this->progressComponentService->createProgressImages($progress->id, $data['images'] ?? [], $request);
            $this->progressComponentService->createProgressMaps($progress->id, $data['maps'] ?? []);

            return $progress;
        });
    }

    public function updateProgress($researchId, $progressId, array $data, Request $request)
    {
        $progress = ResearchProgress::where('research_id', $researchId)
            ->where('id', $progressId)
            ->firstOrFail();

        return DB::transaction(function () use ($progress, $data, $request) {
            ProgressVideo::where('progress_research_id', $progress->id)->delete();
            ProgressMap::where('progress_research_id', $progress->id)->delete();

            $this->progressComponentService->updateTextEditors($progress->id, $data['text_editors'] ?? []);

            $this->progressComponentService->updateProgressImages($progress->id, $request);

            $progress->update(array_filter([
                'judul_progres' => $data['judul_progres'] ?? null,
                'title_progress' => $data['title_progress'] ?? null,
                'deskripsi' => $data['deskripsi'] ?? null,
                'description' => $data['description'] ?? null,
            ]));

            $this->progressComponentService->createProgressVideos($progress->id, $data['videos'] ?? []);
            $this->progressComponentService->createProgressMaps($progress->id, $data['maps'] ?? []);

            return $progress->fresh(['progress_videos', 'text_editors', 'progress_images', 'progress_maps']);
        });
    }

    public function deleteProgress($researchId, $progressId)
    {
        $progress = ResearchProgress::where('research_id', $researchId)
            ->where('id', $progressId)
            ->firstOrFail();

        return DB::transaction(function () use ($progress) {
            ProgressVideo::where('progress_research_id', $progress->id)->delete();
            ProgressMap::where('progress_research_id', $progress->id)->delete();
            TextEditor::where('progress_research_id', $progress->id)->delete();

            $progressImages = ProgressImage::where('progress_research_id', $progress->id)->get();
            foreach ($progressImages as $image) {
                if ($image->image && Storage::disk('public')->exists($image->image)) {
                    Storage::disk('public')->delete($image->image);
                }
                $image->delete();
            }

            $progress->delete();
            return true;
        });
    }
}
