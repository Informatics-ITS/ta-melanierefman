<?php

namespace Modules\ResearchProgress\Services;

use Illuminate\Http\Request;

class ResearchProgressService
{
    protected $progressReaderService;
    protected $progressWriterService;
    protected $progressComponentService;

    public function __construct(
        ProgressReaderService $progressReaderService,
        ProgressWriterService $progressWriterService,
        ProgressComponentService $progressComponentService
    ) {
        $this->progressReaderService = $progressReaderService;
        $this->progressWriterService = $progressWriterService;
        $this->progressComponentService = $progressComponentService;
    }

    public function getResearchWithProgress($researchId)
    {
        return $this->progressReaderService->getResearchWithProgress($researchId);
    }

    public function getProgressBySlug($title, $progressTitle)
    {
        return $this->progressReaderService->getProgressBySlug($title, $progressTitle);
    }

    public function getProgressById($researchId, $progressId)
    {
        return $this->progressReaderService->getProgressById($researchId, $progressId);
    }

    public function createProgress($researchId, array $data, Request $request)
    {
        return $this->progressWriterService->createProgress($researchId, $data, $request);
    }

    public function updateProgress($researchId, $progressId, array $data, Request $request)
    {
        return $this->progressWriterService->updateProgress($researchId, $progressId, $data, $request);
    }

    public function deleteProgress($researchId, $progressId)
    {
        return $this->progressWriterService->deleteProgress($researchId, $progressId);
    }
}
