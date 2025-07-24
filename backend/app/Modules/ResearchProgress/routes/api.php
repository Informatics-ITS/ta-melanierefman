<?php

use Illuminate\Support\Facades\Route;
use Modules\ResearchProgress\Http\Controllers\ResearchProgressController;

Route::prefix('research')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/{researchId}/progress', [ResearchProgressController::class, 'store']);
        Route::post('/{researchId}/progress/{progressId}', [ResearchProgressController::class, 'update']);
        Route::delete('/{researchId}/progress/{progressId}', [ResearchProgressController::class, 'destroy']);
    });

    Route::get('/{researchId}/progress', [ResearchProgressController::class, 'index']);

    Route::get('/{title}/progress/{progressTitle}', [ResearchProgressController::class, 'show']);
    Route::get('/id/{researchId}/progress/id/{progressId}', [ResearchProgressController::class, 'showById']);
});
