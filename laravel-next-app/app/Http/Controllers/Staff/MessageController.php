<?php

namespace App\Http\Controllers\Staff;

use App\Models\ParentMessage;
use Illuminate\Http\Request;
use App\Http\Requests\Staff\MessageRequest as StaffMessageRequest;
use App\Models\Parent_message;
use App\Models\Staff_message;
use App\Models\User;
use App\Models\Group;
use Illuminate\Support\Str;
use App\Models\StaffMessage;
use Illuminate\Support\Facades\Storage;
use PhpParser\NodeVisitor\ParentConnectingVisitor;
use App\Mail\StaffMessageMail;
use Illuminate\Support\Facades\Mail;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sendMessages = StaffMessage::getFormattedMessages();
        $receivedMessages = ParentMessage::getFormattedMessages();
        $groups = Group::with(['users'])->get();
        return response()->json([
            "send_messages"     => $sendMessages,
            "received_messages" => $receivedMessages,
            "groups" => $groups,
        ]);
    }
    public function download(Request $request, $id)
    {
        $message = StaffMessage::findOrFail($id);
    
        $filePath = $message->file_path;

        if (empty($filePath)) {
            abort(404, '添付ファイルはありません。');
        }

        $absolutePath = storage_path('app/public/' . $filePath);

        if (!file_exists($absolutePath)) {
            $absolutePath = public_path($filePath);
        }
    
        if (!file_exists($absolutePath)) {
            abort(404, 'ファイルがサーバー上に存在しません。');
        }

        $fileName = basename($filePath); 
    
        return response()->download($absolutePath, $fileName, [
        'Content-Type' => mime_content_type($absolutePath),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StaffMessageRequest $request)
    {
        $validated = $request->validated();
        $filePath = null;
        if ($request->hasFile('file_path')) {
        $path = $request->file('file_path')->store('messages', 'public');
        $filePath = $path;
    }
        $message = StaffMessage::create([
            'to_type' => $validated['to_type'],
            'to' => $validated['to'],
            'title' => $validated['title'],
            'detail'  => $validated['detail'],
            'file_path' => $filePath,
        ]);
        // グループの場合？個人の場合？
        // みじっそう
        Mail::to('test-parent@example.com')->send(new StaffMessageMail($message));
        return response()->json([
            'success' => true,
            'message' => 'メッセージを送信しました。',
        ], 201);
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
