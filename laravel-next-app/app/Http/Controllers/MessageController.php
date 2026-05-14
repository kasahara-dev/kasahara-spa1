<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Parent_message;
use App\Models\Staff_message;
use App\Models\User;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = auth()->id();
        $userId = 2;

        $messages = User::find($userId)->getMessages();

        // 送受信区分、タイトル、本文
        return response()->json([
            $messages
        ]);
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
