<?php

namespace Modules\Research\Services;

use Modules\Research\Models\Research;
use Modules\Documentation\Models\Documentation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ResearchDocumentationService
{
    public function handleImageUploads(Research $research, array $images, array $data)
    {
        foreach ($images as $imageIndex => $image) {
            $documentation = $this->createDocumentationFromImage($image, $imageIndex, $data);
            $this->attachDocumentationToResearch($research, $documentation);
        }
    }

    public function createDocumentationFromImage($image, $imageIndex, array $data)
    {
        $filePath = $this->storeImage($image, $imageIndex);

        return Documentation::create([
            'image' => $filePath,
            'keterangan' => $data['keterangans'][$imageIndex] ?? null,
            'caption' => $data['captions'][$imageIndex] ?? null,
            'type' => 'image',
        ]);
    }

    public function attachDocumentationToResearch(Research $research, Documentation $documentation, bool $isThumbnail = true)
    {
        DB::table('documentation_research')->insert([
            'research_id' => $research->id,
            'documentation_id' => $documentation->id,
            'is_thumbnail' => $isThumbnail,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function deleteDocumentationFiles(Research $research)
    {
        $documentations = $research->documentations()->get();

        foreach ($documentations as $doc) {
            if ($doc->image && Storage::disk('public')->exists($doc->image)) {
                Storage::disk('public')->delete($doc->image);
            }
            $doc->delete();
        }
    }

    public function getResearchDocumentations(Research $research, string $type = null)
    {
        $query = $research->documentations();

        if ($type) {
            $query->where('type', $type);
        }

        return $query->get();
    }

    public function getThumbnailDocumentations(Research $research)
    {
        return $research->documentations()
            ->wherePivot('is_thumbnail', true)
            ->get();
    }

    private function storeImage($image, $imageIndex)
    {
        return $image->storeAs(
            'documentation',
            now()->format('YmdHis') . "_{$imageIndex}." . $image->getClientOriginalExtension(),
            'public'
        );
    }
}
