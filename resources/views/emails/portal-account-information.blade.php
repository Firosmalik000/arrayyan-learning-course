<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Informasi Login {{ $portalLabel }}</title>
</head>
<body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#334155;">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
        <div style="border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;padding:28px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#1e293b;">Informasi Login {{ $portalLabel }}</h1>
            <p>Assalamu’alaikum {{ $recipientName }},</p>
            <p>Berikut informasi untuk mengakses {{ $portalLabel }} {{ $appName }}.</p>

            @if ($linkedName)
                <p><strong>Data terhubung:</strong> {{ $linkedName }}</p>
            @endif

            <div style="margin:20px 0;border-radius:12px;background:#f1f5f9;padding:16px;">
                <p style="margin:0 0 8px;"><strong>Email login:</strong> {{ $loginIdentity }}</p>
                @if ($temporaryPassword)
                    <p style="margin:0;"><strong>Password sementara:</strong> {{ $temporaryPassword }}</p>
                @else
                    <p style="margin:0;">Gunakan password akun Anda yang berlaku saat ini.</p>
                @endif
            </div>

            @if ($temporaryPassword)
                <p>Anda wajib mengganti password sementara setelah login pertama.</p>
            @endif

            <p style="margin:24px 0;">
                <a href="{{ $portalUrl }}" style="display:inline-block;border-radius:10px;background:#7c3aed;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:700;">Login ke Portal</a>
            </p>
            <p style="margin-bottom:0;font-size:13px;color:#64748b;">Jika Anda tidak mengenali informasi ini, silakan hubungi administrator {{ $appName }}.</p>
        </div>
    </div>
</body>
</html>
