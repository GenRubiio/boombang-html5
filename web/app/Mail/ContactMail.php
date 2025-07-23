<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public $subject;
    public string $title;
    public object $data;
    public string $formName;
    public $view;
    public string $fromName;
    public string $fromAddress;

    /**
     * Create a new message instance.
     */
    public function __construct(string $subject, string $title, object $data)
    {
        $this->subject = $subject;
        $this->title = $title;
        $this->data = $data;
        $this->formName = 'contact';
        $this->view = 'emails.' . $this->formName;
        $this->fromName = config('mail.from.name');
        $this->fromAddress = config('mail.from.address');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address($this->fromAddress, $this->fromName),
            subject: $this->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: $this->view,
            with: [
                'title' => $this->title,
                'data' => (array)$this->data,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
