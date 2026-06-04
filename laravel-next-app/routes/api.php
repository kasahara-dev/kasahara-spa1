<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Staff\CalendarController as StaffCalendarController;
use App\Http\Controllers\Staff\EventController as StaffEventController;
use App\Http\Controllers\Staff\AttendanceController as StaffAttendanceController;
use App\Http\Controllers\Staff\MessageController as StaffMessageController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::middleware('checkRole:staff')->prefix('staff')->group(function () {
        Route::get('/', [StaffCalendarController::class, 'index']);
        Route::patch('/event/{event_id}', [StaffEventController::class, 'update']);
        Route::post('/event',[StaffEventController::class,'store']);
        Route::post('/attendance',[StaffAttendanceController::class,'store']);
        Route::patch('/attendance/{attendance_id}',[StaffAttendanceController::class,'update']);
        Route::delete('/attendance/{attendance_id}',[StaffAttendanceController::class,'destroy']);
        Route::get('staff/messages',  [StaffMessageController::class,'index']);
        Route::post('/messages',  [StaffMessageController::class,'store']);
        Route::get('/messages/{message_id}/download', [StaffMessageController::class, 'download']);
    });
    Route::middleware('checkRole:parent')->group(function () {
        Route::get('/', [CalendarController::class, 'index']);
        Route::get('/messages',  [MessageController::class,'index']);
        Route::post('/messages',  [MessageController::class,'store']);
        Route::get('/messages/{message_id}/download', [MessageController::class, 'download']);
        Route::get('/profile',  [ProfileController::class ,'index']);
        Route::patch('/profile',  [ProfileController::class,  'update']);
        Route::post('/attendance',  [AttendanceController::class , 'store']);
        Route::put('/attendance/{attendance_id}',[AttendanceController::class,'update']);
        Route::delete('/attendance/{attendance_id}',[AttendanceController::class,'destroy']);
    });
});
