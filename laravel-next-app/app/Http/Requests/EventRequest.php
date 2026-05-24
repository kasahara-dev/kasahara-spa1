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
        // 💡 更新（PATCH）の時は、送られてこなくてもOK（sometimes）にします
        // sometimes をつけると、「データが存在するときだけ、後ろのルール（必須や存在チェック）を適用する」となります
        'calendar_id' => $isUpdate ? ['sometimes', 'integer', 'exists:calendars,id'] : ['required', 'integer', 'exists:calendars,id'],
        
        'title'       => ['required', 'string', 'max:255'],
        'detail'      => ['nullable', 'string', 'max:2000'],
        
        // 💡 editor_id はフロントから送らない（コントローラ側で自動セットする）ので、
        // 常に sometimes（あればチェック、なければスルー）にするか、ルールから外してOKです
        'editor_id'   => ['sometimes', 'integer', 'exists:users,id'],
    ];
    }
    public function messages()
    {
        return [
            'calendar_id' => '不正な日付です',
            'title' => 'タイトルは200文字以内で入力してください',
            'detail' => '本文は400文字以内で入力してください',
            'editor_id' => '不正なユーザーです。',
        ];
    }
}
