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

class StaffMessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sendMessages = StaffMessage::getFormattedMessages();
        return response()->json($sendMessages);
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
        if($validated['to_type'] == 0){
            $users = User::where('id', $validated['to'])->get();
        }else{
            $group = Group::find($validated['to']);
            $users = $group ? $group->users()->get() : [];
        }
        $emails = [];
        foreach($users as $user){
            if (!$user->profile) {
                continue;
            }
            $emails[] = $user->profile->email1;
            if($user->profile->email2){
                $emails[] = $user->profile->email2;
            }
            if($user->profile->email3){
                $emails[] = $user->profile->email3;
            }
        }
        $emails = array_unique(array_filter($emails));
        foreach($emails as $email){
            Mail::to($email)->send(new StaffMessageMail($message));
        }
        
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
