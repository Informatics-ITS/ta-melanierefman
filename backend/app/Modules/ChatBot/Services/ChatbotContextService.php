<?php

namespace Modules\ChatBot\Services;

use Modules\About\Models\About;
use Modules\About\Models\Contact;

class ChatbotContextService
{
    protected $chatbotResearchInfoService;
    protected $chatbotPublicationInfoService;
    protected $chatbotMemberInfoService;

    public function __construct(
        ChatbotResearchInfoService $chatbotResearchInfoService,
        ChatbotPublicationInfoService $chatbotPublicationInfoService,
        ChatbotMemberInfoService $chatbotMemberInfoService
    ) {
        $this->chatbotResearchInfoService = $chatbotResearchInfoService;
        $this->chatbotPublicationInfoService = $chatbotPublicationInfoService;
        $this->chatbotMemberInfoService = $chatbotMemberInfoService;
    }

    public function buildContext(): string
    {
        $about = About::all();
        $contact = Contact::all();
        $researchInfo = $this->chatbotResearchInfoService->getResearchInfo();
        $publicationInfo = $this->chatbotPublicationInfoService->getPublicationInfo();
        $memberInfo = $this->chatbotMemberInfoService->getMemberInfo();

        $context = "Informasi dari website:\n";
        $context .= "Tentang:\n$about\n\n";
        $context .= "Kontak:\n$contact\n\n";
        $context .= "Penelitian:\n$researchInfo\n\n";
        $context .= "Publikasi:\n$publicationInfo\n\n";
        $context .= "Anggota:\n$memberInfo\n\n";
        $context .= "Gunakan informasi di atas untuk menjawab pertanyaan berikut:\n";

        return $context;
    }
}
