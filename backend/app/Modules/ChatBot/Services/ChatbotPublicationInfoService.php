<?php

namespace Modules\ChatBot\Services;

use Modules\Publication\Models\Publication;

class ChatbotPublicationInfoService
{
    public function getPublicationInfo(): string
    {
        $publications = Publication::with('research')->get();

        return $publications->map(function ($publicationItem) {
            return "- {$publicationItem->title} ({$publicationItem->year})\n" .
                "  Penulis: {$publicationItem->author}\n" .
                "  Jurnal: {$publicationItem->name_journal}, Vol. {$publicationItem->volume}, Hal. {$publicationItem->page}\n" .
                "  DOI: {$publicationItem->DOI_link}\n" .
                "  Link Artikel: {$publicationItem->article_link}";
        })->implode("\n\n");
    }
}
