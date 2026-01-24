<?php

/**
 * CLEAR ALL CACHES
 *
 * Clear application, route, config, and availability caches
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║                CLEARING ALL CACHES                           ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Clear Laravel cache
echo "1. Clearing application cache...\n";
\Artisan::call('cache:clear');
echo "   ✓ Application cache cleared\n\n";

// Clear config cache
echo "2. Clearing config cache...\n";
\Artisan::call('config:clear');
echo "   ✓ Config cache cleared\n\n";

// Clear route cache
echo "3. Clearing route cache...\n";
\Artisan::call('route:clear');
echo "   ✓ Route cache cleared\n\n";

// Clear view cache
echo "4. Clearing view cache...\n";
\Artisan::call('view:clear');
echo "   ✓ View cache cleared\n\n";

// Clear specific availability caches
echo "5. Clearing package availability caches...\n";
$cacheKeys = \Cache::get('availability_cache_keys', []);

if (empty($cacheKeys)) {
    // Try to clear by pattern (if Redis/Memcached)
    try {
        $pattern = 'package_availability_*';
        \Cache::flush();
        echo "   ✓ Flushed all cache (pattern not supported, flushed everything)\n";
    } catch (\Exception $e) {
        echo "   ⚠️  Could not flush cache: {$e->getMessage()}\n";
    }
} else {
    foreach ($cacheKeys as $key) {
        \Cache::forget($key);
    }
    echo "   ✓ Cleared " . count($cacheKeys) . " availability cache keys\n";
}

echo "\n";

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║                  CACHE CLEARED!                              ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

echo "NEXT STEPS:\n";
echo "1. Refresh browser (Ctrl+F5 or Cmd+Shift+R)\n";
echo "2. Visit: http://agholiday.test/packages/31/book\n";
echo "3. Check if FULL dates now show in RED with 'FULL' label\n\n";
