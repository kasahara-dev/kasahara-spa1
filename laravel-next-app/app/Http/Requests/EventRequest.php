<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class EventRequest extends FormRequest
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
        $isUpdate = $this->isMethod('patch');

    return [
        'calendar_id' => $isUpdate ? ['sometimes', 'integer', 'exists:calendars,id'] : ['required', 'integer', 'exists:calendars,id'],
        'title'       => ['required', 'string', 'max:50'],
        'detail'      => ['required', 'string', 'max:400'],
        'editor_id'   => ['sometimes', 'integer', 'exists:users,id'],
    ];
    }
    public function messages()
    {
        return [
            'calendar_id' => '不正な日付です',
            'title' => 'タイトルは50文字以内で入力してください',
            'detail' => '本文は400文字以内で入力してください',
            'editor_id' => '不正なユーザーです。',
        ];
    }
}
