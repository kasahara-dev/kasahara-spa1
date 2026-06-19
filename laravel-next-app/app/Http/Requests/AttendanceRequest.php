<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AttendanceRequest extends FormRequest
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
            'calendar_id' => 'required|integer|exists:calendars,id',
            'status'      => 'required|in:0,1,2',
            'detail'      => 'required_if:status,2|nullable|string|max:200',
            'working' => 'required|in:1',
        ];
    }
    public function messages(): array
    {
        return [
            'calendar_id.required' => 'カレンダーIDは必須です。',
            'status.required'      => '出欠ステータスを選択してください。',
            'status.in'            => '正しい出欠ステータスを選択してください。',
            'detail.required_if'   => '遅刻その他の場合は、詳細を入力してください。',
            'detail.max'           => '詳細は200文字以内で入力してください。',
            'working' => '園休日です。',
        ];
    }
}
