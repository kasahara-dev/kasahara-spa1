<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BusController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::middleware('checkRole:staff')->prefix('staff')->group(function () {
        Route::get('/staff', [CalendarController::class, 'index']);
    });
    Route::middleware('checkRole:parent')->group(function () {
        Route::get('/', [CalendarController::class, 'index']);
        Route::get('/messages',  [MessageController::class,'index']);
        Route::post('/messages',  [MessageController::class,'store']);
        Route::get('/messages/ {id}/download', [MessageController::class, 'download']);
        Route::get('/profile',  [ProfileController::class ,'index']);
        Route::patch('/profile',  [ProfileController::class,  'update']);
        Route::post('/attendance',  [AttendanceController::class , 'store']);
        Route::put('/attendance/{calendar_id}',[AttendanceController::class,'update']);
        Route::delete('/attendance/{calendar_id}',[AttendanceController::class,'destroy']);
    });
});
