<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Atur Ulang Kata Sandi Portal</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f3ff; color:#1e1b4b; font-family:'Trebuchet MS', Verdana, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
        Gunakan tautan ini untuk mengatur ulang kata sandi Portal ALC Anda.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#f5f3ff;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:640px; overflow:hidden; background-color:#ffffff; border-radius:16px; box-shadow:0 18px 45px rgba(76,29,149,0.12);">
                    <tr>
                        <td style="padding:22px 32px; background-color:#4c1d95;">
                            <p style="margin:0; color:#ffffff; font-size:19px; font-weight:800; line-height:1.2;">Ar Rayyan</p>
                            <p style="margin:3px 0 0; color:#ddd6fe; font-size:10px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Learning Course</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px 16px; text-align:center;">
                            <h1 style="margin:0 0 12px; color:#1e1b4b; font-size:26px; line-height:1.25;">Atur Ulang Kata Sandi</h1>
                            <p style="margin:0 auto; max-width:500px; color:#64748b; font-size:15px; line-height:1.7;">
                                Halo <strong style="color:#334155;">{{ $accountName }}</strong>, kami menerima permintaan untuk mengatur ulang kata sandi akun Portal ALC Anda.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 32px; text-align:center;">
                            <a href="{{ $resetUrl }}" style="display:inline-block; padding:14px 28px; background-color:#6d28d9; border-radius:999px; color:#ffffff; font-size:14px; font-weight:800; line-height:1; text-decoration:none;">Buat Kata Sandi Baru</a>
                            <p style="margin:16px auto 0; max-width:520px; color:#64748b; font-size:12px; line-height:1.6;">
                                Tautan ini berlaku selama {{ $expiresInMinutes }} menit. Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini.
                            </p>
                            <p style="margin:14px auto 0; max-width:520px; color:#94a3b8; font-size:11px; line-height:1.6;">
                                Jika tombol tidak dapat dibuka, salin tautan berikut:<br>
                                <a href="{{ $resetUrl }}" style="color:#6d28d9; text-decoration:underline; word-break:break-all;">{{ $resetUrl }}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 32px; background-color:#fafafa; text-align:center;">
                            <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">Email ini dikirim otomatis oleh sistem {{ $appName }}.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
