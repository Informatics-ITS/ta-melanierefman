<?php

use Illuminate\Support\Facades\Route;
use Modules\ChatBot\Http\Controllers\ChatbotController;

Route::prefix('chatbot')->group(function () {
    Route::post('/', [ChatbotController::class, 'chat']);
});
