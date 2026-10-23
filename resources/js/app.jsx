import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AdminLayout from './Layouts/AdminLayout';
import AdminAuthLayout from './Layouts/AdminAuthLayout';
import PublicLayout from './Layouts/PublicLayout';
import { LanguageProvider } from './lib/i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Ar Rayyan Learning Course';
const pages = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        // Support both flat files (Page.jsx) and folder structure (Page/index.jsx)
        let loadPage = pages[`./Pages/${name}.jsx`];
        if (!loadPage) {
            loadPage = pages[`./Pages/${name}/index.jsx`];
        }
        if (!loadPage) {
            throw new Error(`Page not found: ${name}`);
        }

        const page = await loadPage();

        if (!page.default.layout) {
            if (name.startsWith('Admin/')) {
                page.default.layout = (pageContent) => (
                    <AdminLayout>{pageContent}</AdminLayout>
                );
            } else if (name.startsWith('Portal/') || name.startsWith('Auth/')) {
                page.default.layout = (pageContent) => pageContent;
            } else {
                page.default.layout = (pageContent) => (
                    <PublicLayout>{pageContent}</PublicLayout>
                );
            }
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
