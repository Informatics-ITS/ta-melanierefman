<?php

use Illuminate\Support\Facades\Route;
use Modules\Lecturer\Http\Controllers\LecturerController;

Route::prefix('lecturers')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [LecturerController::class, 'store']);
        Route::post('/{id}', [LecturerController::class, 'update']);
        Route::delete('/{id}', [LecturerController::class, 'destroy']);
    });

    Route::get('/', [LecturerController::class, 'index']);
    Route::get('/{id}', [LecturerController::class, 'show']);
});
