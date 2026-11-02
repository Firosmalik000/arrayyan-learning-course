import { expect, test } from 'bun:test';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BankSoalModal, uploadSizeError } from '../../resources/js/Pages/Admin/BankSoal/index.jsx';

test('upload checks respect the PHP server limit before a file is submitted', () => {
    const limit = 2 * 1024 * 1024;
    expect(uploadSizeError({ size: limit + 1 }, limit)).toContain('2 MB');
    expect(uploadSizeError({ size: limit }, limit)).toBeNull();
    expect(uploadSizeError(null, limit)).toBeNull();
});

test('question bank form shows field errors, upload limits, and the selected filename', () => {
    const errors = {
        format: 'Format wajib diisi.',
        questions: 'Jumlah soal harus bilangan bulat.',
        image: 'Ukuran gambar maksimal 4MB.',
        resources: 'Tambahkan minimal satu file atau link soal.',
        'resources.0.destination_url': 'Link destinasi harus berupa URL yang valid.',
    };
    const form = {
        data: {
            education_level_id: '', education_class_id: '', subject_id: '',
            name: 'Paket latihan', format: '', questions: 0, description: '', is_active: true,
            resources: [{ client_id: 'draft-1', label: '', destination_url: '', file: { name: 'soal.pdf' } }],
        },
        errors,
        processing: false,
    };
    const html = renderToStaticMarkup(createElement(BankSoalModal, {
        form, allLevels: [], availableClasses: [], availableSubjects: [],
        closeModal() {}, submit() {}, updateResource() {},
    }));

    for (const message of Object.values(errors)) {
        expect(html).toContain(message);
    }
    expect(html).toContain('soal.pdf');
    expect(html).toContain('20 MB');
    expect(html).toContain('type="url"');
    expect(html).toContain('aria-modal="true"');
});

test('Vite transforms the React entry and resolves Inertia page imports', async () => {
    const server = await createServer({
        server: { middlewareMode: true, watch: null, hmr: false },
        optimizeDeps: { noDiscovery: true, include: [] },
    });

    try {
        const result = await server.transformRequest('/resources/js/app.jsx');

        expect(result).not.toBeNull();
        expect(result.code).toContain('createInertiaApp');
        expect(result.code).toContain('/resources/js/Pages/');
        expect(result.code).not.toContain('import.meta.glob(');
    } finally {
        await server.close();
    }
});
