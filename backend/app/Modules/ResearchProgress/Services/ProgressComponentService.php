<?php

namespace Modules\ResearchProgress\Services;

use Illuminate\Http\Request;

class ProgressComponentService
{
    protected $progressVideoService;
    protected $progressTextEditorService;
    protected $progressImageService;
    protected $progressMapService;

    public function __construct(
        ProgressVideoService $progressVideoService,
        ProgressTextEditorService $progressTextEditorService,
        ProgressImageService $progressImageService,
        ProgressMapService $progressMapService
    ) {
        $this->progressVideoService = $progressVideoService;
        $this->progressTextEditorService = $progressTextEditorService;
        $this->progressImageService = $progressImageService;
        $this->progressMapService = $progressMapService;
    }

    public function createProgressVideos($progressId, array $videos)
    {
        return $this->progressVideoService->createProgressVideos($progressId, $videos);
    }

    public function createTextEditors($progressId, array $textEditors)
    {
        return $this->progressTextEditorService->createTextEditors($progressId, $textEditors);
    }

    public function createProgressImages($progressId, array $images, Request $request)
    {
        return $this->progressImageService->createProgressImages($progressId, $images, $request);
    }

    public function createProgressMaps($progressId, array $maps)
    {
        return $this->progressMapService->createProgressMaps($progressId, $maps);
    }

    public function updateTextEditors($progressId, array $textEditors)
    {
        return $this->progressTextEditorService->updateTextEditors($progressId, $textEditors);
    }

    public function updateProgressImages($progressId, Request $request)
    {
        return $this->progressImageService->updateProgressImages($progressId, $request);
    }
}
