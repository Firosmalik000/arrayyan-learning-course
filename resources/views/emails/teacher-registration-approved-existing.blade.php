<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Pendaftaran Pengajar Diterima</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f3ff; color:#1e1b4b; font-family:'Trebuchet MS', Verdana, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
        Pendaftaran {{ $teacherName }} telah disetujui dan otomatis terhubung ke akun Portal Pengajar Anda.
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
                                    <td align="right" style="color:#fde68a; font-size:12px; font-weight:700;">Portal Pengajar</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:36px 32px 16px; text-align:center;">
                            <div style="display:inline-block; width:52px; height:52px; border-radius:50%; background-color:#d1fae5; color:#047857; font-size:30px; font-weight:700; line-height:52px; text-align:center;">&#10003;</div>
                            <h1 style="margin:20px 0 10px; color:#1e1b4b; font-size:26px; line-height:1.25;">Pendaftaran Pengajar Diterima!</h1>
                            <p style="margin:0 auto; max-width:500px; color:#64748b; font-size:15px; line-height:1.7;">
                                Halo <strong style="color:#334155;">{{ $teacherName }}</strong>, pendaftaran Anda untuk pengajar mata pelajaran <strong style="color:#4c1d95;">{{ $subjects }}</strong> telah resmi disetujui.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:16px 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#f5f3ff; border:1px solid #ddd6fe; border-radius:14px;">
                                <tr>
                                    <td style="padding:22px 24px; text-align:center;">
                                        <p style="margin:0 0 10px; color:#6d28d9; font-size:12px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase;">Akun Portal Pengajar Anda Sudah Aktif</p>
                                        <p style="margin:0; color:#334155; font-size:14px; line-height:1.6;">
                                            Email <strong>{{ $loginEmail }}</strong> telah terdaftar di sistem Portal Pengajar kami. Anda dapat langsung masuk menggunakan akun dan kata sandi yang sudah Anda miliki.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:12px 32px 8px; text-align:center;">
                            <a href="{{ $portalUrl }}" style="display:inline-block; padding:14px 28px; background-color:#6d28d9; border-radius:999px; color:#ffffff; font-size:14px; font-weight:800; line-height:1; text-decoration:none;">Buka Portal Pengajar</a>
                            <p style="margin:14px auto 0; max-width:520px; color:#94a3b8; font-size:11px; line-height:1.6;">
                                Atau akses melalui:<br>
                                <a href="{{ $portalUrl }}" style="color:#6d28d9; text-decoration:underline; word-break:break-all;">{{ $portalUrl }}</a>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 32px; background-color:#fafafa; text-align:center;">
                            <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">
                                Email ini dikirim otomatis oleh sistem {{ $appName }}.<br>
                                Terima kasih dan selamat mengajar bersama ALC!
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
