<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Pendaftaran Diterima & Akun Portal Orang Tua</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f3ff; color:#1e1b4b; font-family:'Trebuchet MS', Verdana, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
        Selamat! Pendaftaran {{ $studentName }} telah disetujui. Akun Portal Orang Tua Anda telah aktif.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#f5f3ff;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:640px; overflow:hidden; background-color:#ffffff; border-radius:16px; box-shadow:0 18px 45px rgba(76,29,149,0.12);">
                    <tr>
                        <td style="padding:22px 32px; background-color:#4c1d95;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <p style="margin:0; color:#ffffff; font-size:19px; font-weight:800; line-height:1.2;">Ar Rayyan</p>
                                        <p style="margin:3px 0 0; color:#ddd6fe; font-size:10px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase;">Learning Course</p>
                                    </td>
                                    <td align="right" style="color:#fde68a; font-size:12px; font-weight:700;">Portal Orang Tua</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:36px 32px 16px; text-align:center;">
                            <div style="display:inline-block; width:52px; height:52px; border-radius:50%; background-color:#d1fae5; color:#047857; font-size:30px; font-weight:700; line-height:52px; text-align:center;">&#10003;</div>
                            <h1 style="margin:20px 0 10px; color:#1e1b4b; font-size:26px; line-height:1.25;">Pendaftaran Diterima!</h1>
                            <p style="margin:0 auto; max-width:500px; color:#64748b; font-size:15px; line-height:1.7;">
                                Selamat Bapak/Ibu! Pendaftaran ananda <strong style="color:#334155;">{{ $studentName }}</strong> untuk program <strong style="color:#4c1d95;">{{ $programName }}</strong> telah resmi disetujui.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:16px 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#f5f3ff; border:1px solid #ddd6fe; border-radius:14px;">
                                <tr>
                                    <td style="padding:24px;">
                                        <p style="margin:0 0 16px; color:#6d28d9; font-size:12px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; text-align:center;">Kredensial Akun Portal Orang Tua</p>
                                        
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="8" border="0" style="font-size:14px;">
                                            <tr>
                                                <td width="35%" style="color:#64748b; font-weight:600;">Email Login:</td>
                                                <td style="color:#1e1b4b; font-weight:700;">{{ $loginEmail }}</td>
                                            </tr>
                                            <tr>
                                                <td style="color:#64748b; font-weight:600;">Password Sementara:</td>
                                                <td style="color:#4c1d95; font-family:Consolas, 'Courier New', monospace; font-size:16px; font-weight:800;">{{ $temporaryPassword }}</td>
                                            </tr>
                                        </table>

                                        <p style="margin:16px 0 0; color:#64748b; font-size:12px; line-height:1.5; text-align:center;">
                                            *Demi keamanan, Anda akan diminta memperbarui kata sandi saat pertama kali masuk ke portal.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:12px 32px 8px; text-align:center;">
                            <a href="{{ $portalUrl }}" style="display:inline-block; padding:14px 28px; background-color:#6d28d9; border-radius:999px; color:#ffffff; font-size:14px; font-weight:800; line-height:1; text-decoration:none;">Masuk ke Portal Orang Tua</a>
                            <p style="margin:14px auto 0; max-width:520px; color:#94a3b8; font-size:11px; line-height:1.6;">
                                Atau buka langsung tautan berikut:<br>
                                <a href="{{ $portalUrl }}" style="color:#6d28d9; text-decoration:underline; word-break:break-all;">{{ $portalUrl }}</a>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px 32px 36px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#fffbeb; border-radius:12px;">
                                <tr>
                                    <td style="padding:18px 20px;">
                                        <p style="margin:0 0 6px; color:#92400e; font-size:13px; font-weight:800;">Fitur Portal Orang Tua</p>
                                        <p style="margin:0; color:#78350f; font-size:13px; line-height:1.65;">
                                            Melalui Portal Orang Tua, Bapak/Ibu dapat memantau jadwal kelas, rekap kehadiran, evaluasi nilai & perkembangan belajar anak, serta tagihan administrasi dalam satu tempat.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 32px; background-color:#fafafa; text-align:center;">
                            <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">
                                Email ini dikirim otomatis oleh sistem {{ $appName }}.<br>
                                Mohon simpan email ini sebagai referensi akun Anda.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
