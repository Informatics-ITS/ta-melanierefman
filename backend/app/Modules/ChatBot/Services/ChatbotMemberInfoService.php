<?php

namespace Modules\ChatBot\Services;

use Modules\Member\Models\Member;

class ChatbotMemberInfoService
{
    public function getMemberInfo(): string
    {
        $members = Member::with(['members_education', 'members_expertise', 'research'])->get();

        return $members->map(function ($memberItem) {
            $memberStatus = $memberItem->is_alumni == 1 ? "Alumni" : ($memberItem->is_head == 1 ? "Ketua Kelompok Riset" : "Anggota");
            $memberContact = "Kontak Email: {$memberItem->email}, Kontak Phone: {$memberItem->phone}";
            $memberPublication = "Scopus: {$memberItem->scopus_link}, Google Scholar: {$memberItem->scholar_link}";
            $memberRole = "Posisi/Bagian: {$memberItem->role}";

            $memberEducations = $memberItem->members_education->map(function ($educationItem) {
                return "{$educationItem->degree} in {$educationItem->major} ({$educationItem->university})";
            })->implode(", ");

            $memberExpertise = $memberItem->members_expertise->map(function ($expertiseItem) {
                return "ID: {$expertiseItem->kehlian} atau EN: {$expertiseItem->expertise}";
            })->implode(", ");

            $memberResearches = $memberItem->research->map(function ($researchItem) {
                return "ID: {$researchItem->judul} atau EN: {$researchItem->title}";
            })->implode(", ");

            return "- {$memberItem->name} ({$memberStatus})\n  {$memberRole}\n  {$memberContact}\n  {$memberPublication}\n  {$memberExpertise}\n  {$memberEducations} \n  {$memberResearches}";
        })->implode("\n");
    }
}
