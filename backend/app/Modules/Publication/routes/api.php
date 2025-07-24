<?php

use Illuminate\Support\Facades\Route;
use Modules\Publication\Http\Controllers\PublicationController;

Route::prefix('publication')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [PublicationController::class, 'store']);
        Route::post('/{id}', [PublicationController::class, 'update']);
        Route::delete('/{id}', [PublicationController::class, 'destroy']);
    });

    Route::get('/', [PublicationController::class, 'index']);
    Route::get('/year/{year}', [PublicationController::class, 'getPublicationsByYear']);
    Route::get('/available-research', [PublicationController::class, 'getAvailableResearches']);
    Route::get('/researches/{id?}', [PublicationController::class, 'getResearches']);
    Route::get('/{id}', [PublicationController::class, 'show']);
});
