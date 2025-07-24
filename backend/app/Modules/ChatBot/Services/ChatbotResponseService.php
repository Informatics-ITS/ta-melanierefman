<?php

namespace Modules\ChatBot\Services;

use Modules\About\Models\About;

class ChatbotResponseService
{
    public function addContactIfNeeded(string $answer): string
    {
        $answerLower = strtolower($answer);
        $unknownPhrases = ['tidak tahu', 'tidak memiliki informasi', 'tidak tersedia', 'saya tidak yakin', 'tidak ada'];

        $shouldAddContact = collect($unknownPhrases)->contains(function ($phrase) use ($answerLower) {
            return str_contains($answerLower, $phrase);
        });

        if ($shouldAddContact) {
            $about = About::first();
            $emailContact = $about->first()?->email ?? null;

            if ($emailContact) {
                $answer .= "\n\nSilakan hubungi kami di {$emailContact} untuk info lebih lanjut.";
            }
        }

        return $answer;
    }
}
