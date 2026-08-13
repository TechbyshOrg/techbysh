import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fetchPlayListings } from '../../scripts/play-listings/fetch-listings.js';

function createClient(overrides = {}) {
    const abandoned = [];
    const client = {
        abandoned,
        insertEdit: async (packageName) => ({ id: `edit-${packageName}` }),
        getDetails: async () => ({ defaultLanguage: 'en-US' }),
        listListings: async (packageName) => ({
            listings: [{
                language: 'en-US',
                title: packageName === 'com.techbysh.cliply' ? 'Cliply - Clipboard Manager' : 'FlipTap',
                shortDescription: packageName === 'com.techbysh.cliply'
                    ? 'Manage your clipboard history with ease.'
                    : 'A clean counter app: tap or flip to increase the count.'
            }]
        }),
        listImages: async () => ({
            images: [{ id: 'icon-1', url: 'https://play-lh.googleusercontent.com/icon.png' }]
        }),
        deleteEdit: async (packageName, editId) => {
            abandoned.push({ packageName, editId });
        },
        searchAccessibleApps: async () => ({
            apps: [
                { packageName: 'com.techbysh.fliptap', displayName: 'FlipTap' },
                { packageName: 'com.other.secret', displayName: 'Secret' }
            ]
        }),
        ...overrides
    };
    return client;
}

describe('fetchPlayListings', () => {
    it('refuses to fetch when no package names are provided', async () => {
        await assert.rejects(
            () => fetchPlayListings({ client: createClient(), packages: [], overlays: {} }),
            /package name/i
        );
    });

    it('fetches listing text and icon for each configured package', async () => {
        const result = await fetchPlayListings({
            client: createClient(),
            packages: ['com.techbysh.fliptap', 'com.techbysh.cliply'],
            overlays: {
                'com.techbysh.fliptap': { privacyUrl: '/fliptap/privacy_policy.html' },
                'com.techbysh.cliply': { privacyUrl: '/cliply/privacy_policy.html' }
            }
        });

        assert.equal(result.apps.length, 2);
        assert.equal(result.apps[0].name, 'FlipTap');
        assert.equal(result.apps[0].privacyUrl, '/fliptap/privacy_policy.html');
        assert.equal(result.apps[1].package, 'com.techbysh.cliply');
        assert.equal(result.apps[1].icon, 'https://play-lh.googleusercontent.com/icon.png');
        assert.equal(result.errors.length, 0);
    });

    it('abandons the edit after a successful read so it cannot block Play Console', async () => {
        const client = createClient();
        await fetchPlayListings({
            client,
            packages: ['com.techbysh.fliptap'],
            overlays: {}
        });

        assert.deepEqual(client.abandoned, [
            { packageName: 'com.techbysh.fliptap', editId: 'edit-com.techbysh.fliptap' }
        ]);
    });

    it('abandons the edit even when listing retrieval fails', async () => {
        const client = createClient({
            listListings: async () => {
                const error = new Error('Package not found');
                error.code = 404;
                throw error;
            }
        });

        const result = await fetchPlayListings({
            client,
            packages: ['com.missing.app'],
            overlays: {}
        });

        assert.equal(result.apps.length, 0);
        assert.equal(result.errors[0].type, 'not_found');
        assert.equal(result.errors[0].packageName, 'com.missing.app');
        assert.equal(client.abandoned.length, 1);
    });

    it('continues remaining packages after one app is inaccessible', async () => {
        const client = createClient({
            insertEdit: async (packageName) => {
                if (packageName === 'com.missing.app') {
                    const error = new Error('The caller does not have permission');
                    error.code = 403;
                    throw error;
                }
                return { id: `edit-${packageName}` };
            }
        });

        const result = await fetchPlayListings({
            client,
            packages: ['com.missing.app', 'com.techbysh.fliptap'],
            overlays: {}
        });

        assert.equal(result.apps.length, 1);
        assert.equal(result.apps[0].package, 'com.techbysh.fliptap');
        assert.equal(result.errors[0].type, 'permission');
    });

    it('does not publish apps returned by discovery that are outside the configured package list', async () => {
        const result = await fetchPlayListings({
            client: createClient(),
            packages: ['com.techbysh.fliptap'],
            overlays: {},
            discover: true
        });

        assert.deepEqual(result.apps.map((app) => app.package), ['com.techbysh.fliptap']);
        assert.equal(result.apps.some((app) => app.package === 'com.other.secret'), false);
    });

    it('retries rate-limited requests then succeeds', async () => {
        let attempts = 0;
        const client = createClient({
            insertEdit: async (packageName) => {
                attempts += 1;
                if (attempts === 1) {
                    const error = new Error('Quota exceeded');
                    error.code = 429;
                    throw error;
                }
                return { id: `edit-${packageName}` };
            }
        });

        const result = await fetchPlayListings({
            client,
            packages: ['com.techbysh.fliptap'],
            overlays: {},
            sleep: async () => {}
        });

        assert.equal(result.apps.length, 1);
        assert.equal(attempts, 2);
    });
});
