<?php

namespace Modules\Publication\Services;

use Modules\Research\Models\Research;
use Modules\Publication\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PublicationCrudService
{
    protected $publicationFileService;

    public function __construct(PublicationFileService $publicationFileService)
    {
        $this->publicationFileService = $publicationFileService;
    }

    public function createPublication(array $data, Request $request): Publication
    {
        if ($request->hasFile('image')) {
            $data['image'] = $this->publicationFileService->handleImageUpload($request->file('image'));
        }

        if (!empty($data['research_id'])) {
            return $this->createPublicationWithResearch($data);
        }

        return Publication::create($data);
    }

    public function updatePublication(int $id, array $data, Request $request): ?Publication
    {
        $publication = Publication::find($id);

        if (!$publication) {
            return null;
        }

        if ($request->has('research_id')) {
            $data['research_id'] = $request->input('research_id') !== ''
                ? $request->input('research_id')
                : null;
        }

        if ($request->hasFile('image')) {
            if ($publication->image) {
                Storage::disk('public')->delete($publication->image);
            }

            $data['image'] = $this->publicationFileService->handleImageUpload($request->file('image'));
        }

        $publication->update($data);

        return $publication;
    }

    public function deletePublication(int $id): bool
    {
        $publication = Publication::find($id);

        if (!$publication) {
            return false;
        }

        if ($publication->image && Storage::disk('public')->exists($publication->image)) {
            Storage::disk('public')->delete($publication->image);
        }

        $publication->delete();

        return true;
    }

    private function createPublicationWithResearch(array $data): Publication
    {
        $research = Research::find($data['research_id']);

        if (!$research) {
            throw new \Exception('Research not found');
        }

        if ($research->publication) {
            throw new \Exception('This research already has a publication');
        }

        return $research->publication()->create($data);
    }
}
