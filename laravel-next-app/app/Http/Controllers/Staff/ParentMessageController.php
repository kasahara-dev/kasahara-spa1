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

class ParentMessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $receivedMessages = ParentMessage::getFormattedMessages();
        return response()->json($receivedMessages);
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
