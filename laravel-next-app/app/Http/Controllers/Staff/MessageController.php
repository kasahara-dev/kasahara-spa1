<?php

namespace App\Http\Controllers\Staff;

use App\Models\ParentMessage;
use Illuminate\Http\Request;
use App\Http\Requests\MessageRequest;
use App\Models\Parent_message;
use App\Models\Staff_message;
use App\Models\User;
use Illuminate\Support\Str;
use App\Models\StaffMessage;
use Illuminate\Support\Facades\Storage;
use PhpParser\NodeVisitor\ParentConnectingVisitor;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // グループ紐づけ必要！
        $sendMessages=StaffMessage::orderBy('created_at','desc')->get();
        $receivedMessages = ParentMessage::with(['user', 'child.schoolClass'])->orderBy('created_at','desc')->get();
        return response()->json(["send_messages"=>$sendMessages,"received_messages"=>$receivedMessages]);
    }
    public function download(Request $request, $id)
    {
        $message = StaffMessage::findOrFail($id);
        $this->authorize('view', $message);
        $filePath = $message->file_path;
        $absolutePath = storage_path('app/public/' . $filePath);

        if (!file_exists($absolutePath)) {
            $absolutePath = public_path($filePath);
        }
        if (!file_exists($absolutePath)) {
            abort(404, 'ファイルが存在しません。');
        }

        return response()->download($absolutePath, basename($filePath));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MessageRequest $request)
    {
        $validated = $request->validated();
        $message = ParentMessage::create([
            'from' => auth()->id(),
            'detail'  => $validated['detail'],
        ]);
        return response()->json([
            'success' => true,
            'message' => 'お問い合わせを送信しました。',
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
