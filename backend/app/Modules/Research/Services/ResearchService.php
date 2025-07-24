<?php

namespace Modules\Research\Services;

use Modules\Research\Models\Research;

class ResearchService
{
    protected $researchCrudService;
    protected $researchQueryService;
    protected $researchMemberService;
    protected $researchDocumentationService;

    public function __construct(
        ResearchCrudService $researchCrudService,
        ResearchQueryService $researchQueryService,
        ResearchMemberService $researchMemberService,
        ResearchDocumentationService $researchDocumentationService
    ) {
        $this->researchCrudService = $researchCrudService;
        $this->researchQueryService = $researchQueryService;
        $this->researchMemberService = $researchMemberService;
        $this->researchDocumentationService = $researchDocumentationService;
    }

    public function getAllResearch()
    {
        return $this->researchQueryService->getAllWithRelations();
    }

    public function getResearchByYear($year)
    {
        return $this->researchQueryService->getByYear($year);
    }

    public function getResearchById($id)
    {
        return $this->researchQueryService->getByIdWithRelations($id);
    }

    public function createResearch(array $data, $files = null)
    {
        $research = $this->researchCrudService->create($data);

        if ($files && isset($files['images'])) {
            $this->researchDocumentationService->handleImageUploads($research, $files['images'], $data);
        }

        $this->researchMemberService->attachMembers($research, $data);

        return $research->load('documentations');
    }

    public function updateResearch(Research $research, array $data)
    {
        $updatedResearch = $this->researchCrudService->update($research, $data);

        if (isset($data['coordinator_id']) || isset($data['member_ids'])) {
            $this->researchMemberService->updateMembers($research, $data);
        }

        return $updatedResearch->load('documentations');
    }

    public function deleteResearch($id)
    {
        return $this->researchCrudService->delete($id);
    }
}
