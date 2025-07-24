<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserAccountCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $email;
    public $password;

    /**
     * Create a new message instance.
     */
    public function __construct($email, $password)
    {
        $this->email = $email;
        $this->password = $password;
    }

    public function build()
    {
        return $this->subject('Your Account Details')
            ->view('send_password')
            ->with([
                'email' => $this->email,
                'password' => $this->password,
            ]);
    }
}
