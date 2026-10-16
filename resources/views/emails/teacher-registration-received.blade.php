<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Pendaftaran Calon Pengajar Berhasil Dikirim</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f3ff; color:#1e1b4b; font-family:'Trebuchet MS', Verdana, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
        Nomor tiket pendaftaran {{ $teacherName }} adalah {{ $ticket }}. Simpan email ini untuk memeriksa status pendaftaran pengajar.
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
                                    <td align="right" style="color:#fde68a; font-size:12px; font-weight:700;">Rekrutmen Pengajar</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:36px 32px 16px; text-align:center;">
                            <div style="display:inline-block; width:52px; height:52px; border-radius:50%; background-color:#d1fae5; color:#047857; font-size:30px; font-weight:700; line-height:52px; text-align:center;">&#10003;</div>
                            <h1 style="margin:20px 0 10px; color:#1e1b4b; font-size:26px; line-height:1.25;">Lamaran Berhasil Diterima!</h1>
                            <p style="margin:0 auto; max-width:500px; color:#64748b; font-size:15px; line-height:1.7;">
                                Halo <strong style="color:#334155;">{{ $teacherName }}</strong>, formulir pendaftaran calon pengajar Anda telah berhasil kami terima di sistem {{ $appName }}.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:16px 32px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#f5f3ff; border-radius:14px;">
                                <tr>
                                    <td style="padding:24px; text-align:center;">
                                        <p style="margin:0 0 10px; color:#6d28d9; font-size:11px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase;">Nomor Tiket Pendaftaran</p>
                                        <p style="margin:0; color:#4c1d95; font-family:Consolas, 'Courier New', monospace; font-size:28px; font-weight:800; letter-spacing:0.04em; line-height:1.3;">{{ $ticket }}</p>
                                        <p style="margin:12px 0 0; color:#64748b; font-size:13px; line-height:1.6;">Simpan nomor tiket ini untuk memantau status seleksi berkas Anda.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    @if($teacherRole || $city || $district)
                    <tr>
                        <td style="padding:0 32px 16px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; border:1px solid #e9d5ff; border-radius:12px; background-color:#ffffff; overflow:hidden;">
                                @if($teacherRole)
                                <tr>
                                    <td style="padding:12px 16px; border-bottom:1px solid #f3e8ff; color:#6b21a8; font-size:12px; font-weight:700; width:40%;">Jenjang yang Diajar</td>
                                    <td style="padding:12px 16px; border-bottom:1px solid #f3e8ff; color:#1e1b4b; font-size:13px; font-weight:600;">{{ $teacherRole }}</td>
                                </tr>
                                @endif
                                @if($city || $district)
                                <tr>
                                    <td style="padding:12px 16px; color:#6b21a8; font-size:12px; font-weight:700; width:40%;">Domisili</td>
                                    <td style="padding:12px 16px; color:#1e1b4b; font-size:13px; font-weight:600;">
                                        {{ implode(', ', array_filter([$district ? 'Kec. '.$district : null, $city])) }}
                                    </td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                    @endif

                    <tr>
                        <td style="padding:12px 32px 8px; text-align:center;">
                            <a href="{{ $statusUrl }}" style="display:inline-block; padding:14px 24px; background-color:#6d28d9; border-radius:999px; color:#ffffff; font-size:14px; font-weight:800; line-height:1; text-decoration:none;">Cek Status Pendaftaran</a>
                            <p style="margin:14px auto 0; max-width:520px; color:#94a3b8; font-size:11px; line-height:1.6;">
                                Jika tombol tidak dapat diklik, salin tautan berikut ke browser:<br>
                                <a href="{{ $statusUrl }}" style="color:#6d28d9; text-decoration:underline; word-break:break-all;">{{ $statusUrl }}</a>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px 32px 36px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#fffbeb; border-radius:12px;">
                                <tr>
                                    <td style="padding:18px 20px;">
                                        <p style="margin:0 0 6px; color:#92400e; font-size:13px; font-weight:800;">Tahapan Selanjutnya</p>
                                        <p style="margin:0; color:#78350f; font-size:13px; line-height:1.65;">Tim ALC akan meninjau kualifikasi dan CV Anda. Jika lolos tahap administrasi, Anda akan menerima email persetujuan serta akun akses Portal Pengajar.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 32px; background-color:#fafafa; text-align:center;">
                            <p style="margin:0; color:#64748b; font-size:11px; line-height:1.6;">
                                Email ini dikirim otomatis setelah pendaftaran calon pengajar berhasil dikirim.<br>
                                Terima kasih atas minat Anda bergabung bersama {{ $appName }}.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
