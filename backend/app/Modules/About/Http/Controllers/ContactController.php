<?php

namespace Modules\About\Http\Controllers;

use Modules\About\Models\Contact;

use App\Mail\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        Contact::create($validatedData);

        // Kirim email
        Mail::to('melanierefman84@gmail.com')
            ->send(new ContactMessage($validatedData));

        return response()->json([
            'message' => 'Pesan berhasil dikirim!',
        ], 200);
    }
}
