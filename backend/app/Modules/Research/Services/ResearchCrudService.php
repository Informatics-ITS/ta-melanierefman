<?php

namespace Modules\Research\Services;

use Modules\Research\Models\Research;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ResearchCrudService
{
    public function create(array $data)
    {
        $processedData = $this->processDateFields($data);

        return Research::create([
            'user_id' => $processedData['user_id'],
            'judul' => $processedData['judul'],
            'title' => $processedData['title'],
            'deskripsi' => $processedData['deskripsi'],
            'description' => $processedData['description'],
            'latitude' => $processedData['latitude'] ?? null,
            'longitude' => $processedData['longitude'] ?? null,
            'zoom' => $processedData['zoom'] ?? null,
            'start_date' => $processedData['start_date'] ?? null,
            'end_date' => $processedData['end_date'] ?? null,
        ]);
    }

    public function update(Research $research, array $data)
    {
        $processedData = $this->processDateFields($data);
        $research->update(array_filter($processedData));

        return $research;
    }

    public function delete($id)
    {
        $research = Research::find($id);

        if (!$research) {
            return false;
        }

        return DB::transaction(function () use ($research) {
            $this->deleteRelatedData($research);
            $research->delete();
            return true;
        });
    }

    private function processDateFields(array $data)
    {
        $processedData = $data;

        if (!empty($data['start_year']) && !empty($data['start_month'])) {
            $processedData['start_date'] = Carbon::createFromFormat('Y-m-d', "{$data['start_year']}-{$data['start_month']}-01")->format('Y-m-d');
        }

        if (!empty($data['end_year']) && !empty($data['end_month'])) {
            $processedData['end_date'] = Carbon::createFromFormat('Y-m-d', "{$data['end_year']}-{$data['end_month']}-01")->format('Y-m-d');
        }

        return $processedData;
    }

    private function deleteRelatedData(Research $research)
    {
        $research->research_progress()->delete();

        if ($research->publication) {
            $research->publication->delete();
        }

        $research->members()->detach();

        $this->handlePartnersDeletion($research);

        $this->handleDocumentationsDeletion($research);
    }

    private function handlePartnersDeletion(Research $research)
    {
        $research->partners()->each(function ($partner) use ($research) {
            $partner->research()->detach($research->id);

            if ($partner->research()->count() == 0) {
                $partner->partners_member()->each(function ($partnerMember) {
                    $partnerMember->delete();
                });
                $partner->delete();
            }
        });
    }

    private function handleDocumentationsDeletion(Research $research)
    {
        $documentations = $research->documentations()->get();
        foreach ($documentations as $doc) {
            if ($doc->image && Storage::disk('public')->exists($doc->image)) {
                Storage::disk('public')->delete($doc->image);
            }
            $doc->delete();
        }
    }
}
