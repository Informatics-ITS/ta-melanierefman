<?php

namespace Modules\ChatBot\Http\Controllers;

use Modules\ChatBot\Services\ChatbotService;
use Modules\ChatBot\Http\Requests\ChatRequest;
use Illuminate\Http\JsonResponse;

class ChatbotController extends Controller
{
    protected $chatbotService;

    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    public function chat(ChatRequest $request): JsonResponse
    {
        try {
            $result = $this->chatbotService->processChat($request->validated());

            return response()->json([
                'question' => $result['question'],
                'answer' => $result['answer'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate answer',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
