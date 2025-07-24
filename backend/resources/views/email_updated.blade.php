<!DOCTYPE html>
<html>

<head>
    <title>Your Account Email</title>
    <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600&display=swap" rel="stylesheet">
</head>

<body style="font-family: 'Work Sans', sans-serif; background-color: #f4f4f4; margin: 0; padding: 40px;">
    <div style="max-width: 500px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center;">
            <img src="{{ url('brin.png') }}" alt="Logo KR PALEO BRIN" style="max-width: 100%; height: auto;">
        </div>
        <div style="padding: 20px; text-align: center;">
            <h2 style="color: #333333; text-align: center; margin-bottom: 20px;"><strong>Your Email Has Been Updated</strong></h2>

            <p style="font-size: 16px; color: #555555;">Your email has been successfully updated. Here are your updated credentials:</p>

            <p style="font-size: 16px;"><strong>New Email:</strong> {{ $user->email }}</p>

            @if($newPassword)
            <p style="font-size: 16px;"><strong>Password:</strong> {{ $newPassword }}</p>
            @endif

            <p style="margin-top: 30px; font-size: 15px; color: #777777;">
                Please don't reply to this message. This email was sent from a notification-only email address that can’t accept incoming email.
            </p>
        </div>
    </div>
</body>

</html>