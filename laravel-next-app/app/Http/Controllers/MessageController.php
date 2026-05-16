<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Parent_message;
use App\Models\Staff_message;
use App\Models\User;
use Illuminate\Support\Str;
use App\Models\StaffMessage;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = auth()->id();
        // $userId = 2;

        $messages = User::find($userId)->getMessages();

        // 送受信区分、タイトル、本文
        return response()->json($messages);
    }
    public function download(Request $request, $id)
    {
        $message = StaffMessage::findOrFail($id);
        $filePath = $message->file_path;
        // $cleanedPath = Str::replaceFirst('storage/', '', $filePath);
        $absolutePath = storage_path('app/public/' . $filePath);

        if (!file_exists($absolutePath)) {
            $absolutePath = public_path($filePath); // そのまま渡すだけでピッタリ一致！
        }
        if (!file_exists($absolutePath)) {
            abort(404, 'ファイルが存在しません。');
        }

        return response()->download($absolutePath, basename($filePath));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
