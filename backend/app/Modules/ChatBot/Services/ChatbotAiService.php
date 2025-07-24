<?php

namespace Modules\ChatBot\Services;

use GeminiAPI\Client;
use GeminiAPI\Resources\Parts\TextPart;

class ChatbotAiService
{
    public function generateAnswer(string $prompt): string
    {
        $client = new Client(config('services.gemini.api_key'));

        $response = $client->geminiProFlash1_5()->generateContent(
            new TextPart($prompt)
        );

        return $response->text();
    }
}
