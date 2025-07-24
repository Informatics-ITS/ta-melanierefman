<?php

namespace Modules\ChatBot\Services;

use Carbon\Carbon;
use Modules\Research\Models\Research;

class ChatbotResearchInfoService
{
    public function getResearchInfo(): string
    {
        $researches = Research::with(['research_progress', 'publication', 'members', 'partners'])->get();

        return $researches->map(function ($researchItem) {
            $memberNames = $researchItem->members->pluck('name')->implode(', ');
            $partnerNames = $researchItem->partners->pluck('name')->implode(', ');
            $publicationTitle = $researchItem->publication ? $researchItem->publication->title : '-';
            $startYear = $researchItem->start_date ? Carbon::parse($researchItem->start_date)->format('Y-m') : 'N/A';
            $endYear = $researchItem->end_date ? Carbon::parse($researchItem->end_date)->format('Y-m') : 'N/A';
            $progressList = $researchItem->research_progress->map(function ($progressItem, $progressIndex) {
                return "    " . ($progressIndex + 1) . ". {$progressItem->judul_progres} / {$progressItem->title_progress}\n" .
                    "       Deskripsi: {$progressItem->description}";
            })->implode("\n");

            return "- ID: {$researchItem->judul}\n" .
                "  EN: {$researchItem->title} ({$startYear} - {$endYear})\n" .
                "  Deskripsi: {$researchItem->description}\n" .
                "  Lokasi: Lat {$researchItem->latitude}, Lng {$researchItem->longitude}, Zoom {$researchItem->zoom}\n" .
                "  Anggota: {$memberNames}\n" .
                "  Mitra/Kolaborator: {$partnerNames}\n" .
                "  Jumlah Progres: {$researchItem->research_progress->count()}\n" .
                "  Publikasi: {$publicationTitle}\n" .
                "  Progres Penelitian:\n" . ($progressList ?: "    - Tidak ada progres");
        })->implode("\n\n");
    }
}
