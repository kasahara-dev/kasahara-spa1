<?php

namespace App\Mail;

use App\Models\StaffMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public $staffMessage;
    /**
     * Create a new message instance.
     */
    public function __construct(StaffMessage $staffMessage)
    {
        $this->staffMessage = $staffMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '【'. env('APP_NAME').'】' . $this->staffMessage->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            text: 'emails.staff_message_text',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        // ファイルが添付されている場合のみ、メールにくっつける
        if ($this->staffMessage->file_path) {
            return [
                Attachment::fromStorageDisk('public', $this->staffMessage->file_path)
            ];
        }

        return [];
    }
}
