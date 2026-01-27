import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AdminLayout from './Layouts/AdminLayout';
import AdminAuthLayout from './Layouts/AdminAuthLayout';
import PublicLayout from './Layouts/PublicLayout';
import { LanguageProvider } from './lib/i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Ar Rayyan Learning Course';
const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Support both flat files (Page.jsx) and folder structure (Page/index.jsx)
        let page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            page = pages[`./Pages/${name}/index.jsx`];
        }
        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        if (!page.default.layout) {
            page.default.layout = name.startsWith('Admin/')
                ? (pageContent) => (
                      <AdminLayout>{pageContent}</AdminLayout>
                  )
                : (pageContent) => (
                      <PublicLayout>{pageContent}</PublicLayout>
                  );
        }

        if (name === 'Admin/Login') {
            page.default.layout = (pageContent) => (
                <AdminAuthLayout>{pageContent}</AdminAuthLayout>
            );
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <LanguageProvider>
                <App {...props} />
            </LanguageProvider>
        );
    },
    progress: {
        color: '#5b2a86',
    },
});
