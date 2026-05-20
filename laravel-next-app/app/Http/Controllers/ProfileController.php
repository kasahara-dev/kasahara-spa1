<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;

class ProfileController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $profile = $user->profile;
        if (!$profile) {
            return response()->json([
                'message' => 'プロフィールが見つかりません。'
            ], 404);
        }
        return response()->json([
            'email1' => $profile->email1,
            'email2' => $profile->email2,
            'email3' => $profile->email3,
            'tel1'   => $profile->tel1,
            'tel2'   => $profile->tel2,
            'tel3'   => $profile->tel3,
        ]);
    }
    public function update(ProfileRequest $request)
    {
        $profile = Auth::user()->profile;
        if (!$profile) {
            return response()->json(['message' => 'プロフィールが見つかりません。'], 404);
        }
        $validated = $request->validated();
        $profile->update($validated);
        return response()->json([
            'message' => '連絡先を更新しました。',
            'data' => $profile
        ], 200);
    }
}
