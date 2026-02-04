<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Undangan Admin</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:Arial, sans-serif; color:#0f172a;">
    <div style="max-width:620px; margin:0 auto; padding:24px;">
        <div style="background-color:#ffffff; border-radius:16px; padding:28px; border:1px solid #e2e8f0;">
            <h1 style="margin:0 0 12px; font-size:22px; color:#111827;">
                Undangan Admin {{ $appName }}
            </h1>
            <p style="margin:0 0 16px; font-size:14px; color:#334155;">
                Halo {{ $user->name }}, kamu diundang untuk mengelola panel admin {{ $appName }}.
            </p>
            <div style="background-color:#f8fafc; border-radius:12px; padding:16px; margin:16px 0;">
                <p style="margin:0 0 6px; font-size:12px; color:#64748b;">Role</p>
                <p style="margin:0 0 12px; font-size:14px; font-weight:bold; color:#1f2937;">
                    {{ $role->label ?: $role->name }}
                </p>
                <p style="margin:0 0 6px; font-size:12px; color:#64748b;">Email</p>
                <p style="margin:0 0 12px; font-size:14px; font-weight:bold; color:#1f2937;">
                    {{ $user->email }}
                </p>
                <p style="margin:0 0 6px; font-size:12px; color:#64748b;">Password sementara</p>
                <p style="margin:0; font-size:14px; font-weight:bold; color:#1f2937;">
                    {{ $temporaryPassword }}
                </p>
            </div>
            <a
                href="{{ $loginUrl }}"
                style="display:inline-block; padding:12px 20px; background-color:#6d28d9; color:#ffffff; text-decoration:none; border-radius:999px; font-size:13px; font-weight:bold;"
            >
                Masuk ke Admin
            </a>
            <p style="margin:16px 0 0; font-size:12px; color:#64748b;">
                Setelah login, segera ganti password untuk keamanan akun.
            </p>
            <p style="margin:16px 0 0; font-size:12px; color:#94a3b8;">
                Diundang oleh {{ $inviter?->name ?? 'Tim Admin' }}.
            </p>
        </div>
    </div>
</body>
</html>
