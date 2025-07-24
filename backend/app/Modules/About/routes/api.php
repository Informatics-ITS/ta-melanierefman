<?php

use Illuminate\Support\Facades\Route;
use Modules\About\Http\Controllers\AboutController;
use Modules\About\Http\Controllers\ContactController;

Route::prefix('about')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::put('/', [AboutController::class, 'update']);
        Route::post('/contact', [ContactController::class, 'store']);
    });

    Route::get('/', [AboutController::class, 'show']);
});
