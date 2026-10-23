<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') - Ar Rayyan Learning Course</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Poppins:wght@700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --color-primary: #7c3aed;
            --color-primary-dark: #5b2a86;
            --color-secondary: #f59e0b;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background-color: #fafbfc;
            color: #1e293b;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 40%);
        }
        .header {
            padding: 1.25rem 2rem;
            border-bottom: 1px solid rgba(226, 232, 240, 0.8);
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: inherit;
        }
        .logo-box {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: #f5f3ff;
            border: 1px solid #ddd6fe;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            color: var(--color-primary);
            font-size: 0.85rem;
        }
        .brand-text h1 {
            font-size: 1.1rem;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.1;
        }
        .brand-text span {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #64748b;
            text-transform: uppercase;
        }
        .main-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
        }
        .card {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e2e8f0;
            border-radius: 1.5rem;
            padding: 2.5rem 2rem;
            max-width: 580px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.07);
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.35rem 1rem;
            border-radius: 9999px;
            background: #f5f3ff;
            border: 1px solid #ddd6fe;
            color: var(--color-primary);
            font-size: 0.8rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--color-primary);
        }
        .error-code {
            font-size: 4rem;
            font-weight: 900;
            line-height: 1;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, var(--color-primary), #4f46e5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.75rem;
        }
        .error-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.75rem;
        }
        .error-desc {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        .btn-group {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            justify-content: center;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.4rem;
            border-radius: 0.75rem;
            font-weight: 700;
            font-size: 0.875rem;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
        }
        .btn-primary {
            background: linear-gradient(135deg, var(--color-primary), #4f46e5);
            color: white;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
            border: none;
        }
        .btn-primary:hover {
            opacity: 0.95;
            transform: translateY(-1px);
        }
        .btn-outline {
            background: white;
            color: #334155;
            border: 1px solid #cbd5e1;
        }
        .btn-outline:hover {
            background: #f8fafc;
            border-color: #94a3b8;
        }
        .footer {
            padding: 1.25rem 2rem;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 0.8rem;
            color: #64748b;
            background: rgba(255, 255, 255, 0.7);
        }
    </style>
</head>
<body>
    <header class="header">
        <a href="/" class="brand">
            <div class="logo-box">ALC</div>
            <div class="brand-text">
                <h1>Ar Rayyan</h1>
                <span>Learning Course</span>
            </div>
        </a>
        <a href="/" class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.75rem;">Beranda</a>
    </header>

    <main class="main-container">
        <div class="card">
            <div class="status-badge">
                <span class="status-dot"></span>
                <span>@yield('badge', 'Status ' . $__env->yieldContent('code'))</span>
            </div>
            <div class="error-code">@yield('code')</div>
            <h2 class="error-title">@yield('title')</h2>
            <p class="error-desc">@yield('message')</p>
            <div class="btn-group">
                <a href="/" class="btn btn-primary">Kembali ke Beranda</a>
                <button type="button" onclick="window.location.reload()" class="btn btn-outline">Muat Ulang</button>
            </div>
        </div>
    </main>

    <footer class="footer">
        &copy; {{ date('Y') }} Ar Rayyan Learning Course. Hak Cipta Dilindungi.
    </footer>
</body>
</html>
