<?php

use Illuminate\Support\Facades\Route;
use Modules\Member\Http\Controllers\MemberController;
use Modules\Member\Http\Controllers\MemberExpertiseController;

Route::prefix('members')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [MemberController::class, 'store']);
        Route::post('/{member}', [MemberController::class, 'update']);
        Route::delete('/{id}', [MemberController::class, 'destroy']);
    });

    Route::get('/expertises', [MemberExpertiseController::class, 'index']);
    Route::get('/', [MemberController::class, 'index']);
    Route::get('/{id}', [MemberController::class, 'show']);
    Route::get('/expertises/{id}', [MemberExpertiseController::class, 'show']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/expertises', [MemberExpertiseController::class, 'store']);
    Route::put('/expertises/{id}', [MemberExpertiseController::class, 'update']);
    Route::delete('/expertises/{id}', [MemberExpertiseController::class, 'destroy']);
});
