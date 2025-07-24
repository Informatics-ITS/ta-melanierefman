<?php

namespace Modules\ChatBot\Services;

class ChatbotService
{
    protected $chatbotContextService;
    protected $chatbotAiService;
    protected $chatbotResponseService;

    public function __construct(
        ChatbotContextService $chatbotContextService,
        ChatbotAiService $chatbotAiService,
        ChatbotResponseService $chatbotResponseService
    ) {
        $this->chatbotContextService = $chatbotContextService;
        $this->chatbotAiService = $chatbotAiService;
        $this->chatbotResponseService = $chatbotResponseService;
    }

    public function processChat(array $validated): array
    {
        $question = $validated['question'];

        $context = $this->chatbotContextService->buildContext();
        $prompt = $context . "\nPertanyaan: " . $question;

        $answer = $this->chatbotAiService->generateAnswer($prompt);
        $answer = $this->chatbotResponseService->addContactIfNeeded($answer);

        return [
            'question' => $question,
            'answer' => $answer,
        ];
    }
}
