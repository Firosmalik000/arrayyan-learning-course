import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        // Code splitting untuk mengurangi ukuran chunk
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-inertia': ['@inertiajs/react'],
                    'vendor-motion': ['framer-motion'],
                },
            },
        },
        // Opsional: naikkan limit warning jika masih muncul
        chunkSizeWarningLimit: 600,
    },
});
