<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmailUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $password;

    public function __construct($user, $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function build()
    {
        return $this->subject('Email Anda Telah Diperbarui')
            ->view('email_updated')
            ->with([
                'user' => $this->user,
                'newPassword' => $this->password,
            ]);
    }
}
