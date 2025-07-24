<?php

use Illuminate\Support\Facades\Route;
use Modules\Documentation\Http\Controllers\DocumentationController;

Route::prefix('documentation')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [DocumentationController::class, 'store']);

        Route::post('/create-details', [DocumentationController::class, 'storeImageDetails']);
        Route::post('/update-details/{id}', [DocumentationController::class, 'updateImageDetails']);
        Route::delete('/delete-details/{id}', [DocumentationController::class, 'deleteImage']);

        Route::post('/about/images', [DocumentationController::class, 'storeImageAbout']);
        Route::post('/about/images/{documentationId}', [DocumentationController::class, 'updateImageAbout']);

        Route::delete('/research/{id}', [DocumentationController::class, 'deleteResearch']);

        Route::post('/{id}', [DocumentationController::class, 'update']);
        Route::delete('/{id}', [DocumentationController::class, 'destroy']);
    });

    Route::get('/about/images', [DocumentationController::class, 'viewImageAbout']);
    Route::get('/images', [DocumentationController::class, 'indexImage']);
    Route::get('/videos', [DocumentationController::class, 'indexVideo']);
    Route::get('/images/{researchId}', [DocumentationController::class, 'indexImageByResearch']);
    Route::get('/videos/{researchId}', [DocumentationController::class, 'indexVideoByResearch']);
    Route::get('/{id}', [DocumentationController::class, 'show']);
});
