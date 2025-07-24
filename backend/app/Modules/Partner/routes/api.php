<?php

use Illuminate\Support\Facades\Route;
use Modules\Partner\Http\Controllers\PartnerController;

Route::prefix('partners')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [PartnerController::class, 'store']);
        Route::put('/{id}', [PartnerController::class, 'update']);
        Route::delete('/{partnerId}', [PartnerController::class, 'destroy']);
    });

    Route::get('/', [PartnerController::class, 'index']);
    Route::get('/{partnerId}', [PartnerController::class, 'show']);
});
