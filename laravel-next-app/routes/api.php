<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BusController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarController;

Route::post('/login', [AuthController::class, 'login']);

// Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    // Route::middleware('checkRole:staff')->prefix('staff')->group(function () {
        Route::get('/staff', [CalendarController::class, 'index']);
    // });
    // Route::middleware('checkRole:parent')->group(function () {
        Route::get('/', [CalendarController::class, 'index']);
    // });
// });
