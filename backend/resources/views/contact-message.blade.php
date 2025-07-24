<!DOCTYPE html>
<html>

<head>
    <title>{{ $data['subject'] }}</title>
</head>

<body>
    <h1>Pesan Baru KR PALEO BRIN Website</h1>
    <p><strong>Nama:</strong> {{ $data['name'] }}</p>
    <p><strong>Email:</strong> {{ $data['email'] }}</p>
    <p><strong>Pesan:</strong></p>
    <p>{{ $data['message'] }}</p>
</body>

</html>