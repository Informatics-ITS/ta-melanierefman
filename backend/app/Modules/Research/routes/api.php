<?php

use Illuminate\Support\Facades\Route;
use Modules\Research\Http\Controllers\ResearchController;

Route::prefix('research')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [ResearchController::class, 'store']);
        Route::post('/{research}', [ResearchController::class, 'update']);
        Route::delete('/{id}', [ResearchController::class, 'destroy']);
    });

    Route::get('/', [ResearchController::class, 'index']);
    Route::get('/year/{year}', [ResearchController::class, 'getResearchByYear']);
    Route::get('/{id}', [ResearchController::class, 'show']);
});
