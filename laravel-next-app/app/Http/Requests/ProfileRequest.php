<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
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
            'email1' => 'sometimes|required|email|max:255',
            'email2' => 'sometimes|nullable|email|max:255',
            'email3' => 'sometimes|nullable|email|max:255',
            'tel1'   => 'sometimes|required|string|max:20',
            'tel2'   => 'sometimes|nullable|string|max:20',
            'tel3'   => 'sometimes|nullable|string|max:20',
        ];
    }
    public function messages(): array
    {
        return [
            'required' => 'この項目は必須です。',
            'email'    => '正しいメールアドレスの形式で入力してください。',
            'max'      => ':max 文字以内で入力してください。',
        ];
    }
}
