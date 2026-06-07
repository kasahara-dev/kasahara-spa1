<?php

namespace App\Http\Requests\Staff;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
        'to_type'   => 'required|in:0,1',
        'to'        => 'required|integer',
        'title'     => 'required|string|max:50',
        'detail'    => 'required|string|max:400',
        'file_path' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
    ];
    }
    public function messages(): array
    {
        return [
        'title'       => 'タイトルを50文字以内で入力してください。',
        'detail.required'      => '本文を400文字以内で入力してください。',
        'detail.max'      => '本文を400文字以内で入力してください。長い案内はファイルを添付してください。',
        'file_path.file'  => 'アップロードされたものはファイルではありません。',
        'file_path.mimes' => '添付できるファイルは PDF, JPG, JPEG, PNG 形式のみです。',
        'file_path.max'   => 'ファイルサイズが大きすぎます。5MB以内のファイルを添付してください。',
    ];
    }
}
