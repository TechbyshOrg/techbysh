import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fetchPublicPlayListings } from '../../scripts/play-listings/public-fetch.js';

describe('fetchPublicPlayListings', () => {
    it('loads public listing cards by package ID, including apps found on the developer page', async () => {
        const pages = {
                    'https://play.google.com/store/apps/developer?id=Techbysh&hl=en&gl=US': `
                <a href="/store/apps/details?id=com.techbysh.trackpit"></a>
                <a href="/store/apps/details?id=com.techbysh.cliply"></a>
                <a href="/store/apps/details?id=com.techbysh.fliptap"></a>
                <a href="/store/apps/details?id=com.other.recommended"></a>
            `,
            'https://play.google.com/store/apps/details?id=com.techbysh.fliptap&hl=en&gl=US': `
                <meta property="og:title" content="FlipTap - Gesture Counter - Apps on Google Play">
                <meta property="og:image" content="https://play-lh.googleusercontent.com/fliptap-icon">
                <meta itemprop="description" content="Tally counts with gestures, screen taps, or a floating window over other apps.">
            `,
            'https://play.google.com/store/apps/details?id=com.techbysh.cliply&hl=en&gl=US': `
                <meta property="og:title" content="Cliply: Clipboard Manager - Apps on Google Play">
                <meta property="og:image" content="https://play-lh.googleusercontent.com/cliply-icon">
                <meta itemprop="description" content="Clipboard manager to save, organize, and quickly access copied text.">
            `,
            'https://play.google.com/store/apps/details?id=com.techbysh.trackpit&hl=en&gl=US': `
                <meta property="og:title" content="Trackpit - Expense Tracker - Apps on Google Play">
                <meta property="og:image" content="https://play-lh.googleusercontent.com/trackpit-icon">
                <meta itemprop="description" content="Scan, categorize, pay, and track every UPI expense instantly.">
            `
        };

        const result = await fetchPublicPlayListings({
            packages: ['com.techbysh.fliptap', 'com.techbysh.cliply'],
            developerName: 'Techbysh',
            overlays: {
                'com.techbysh.fliptap': { privacyUrl: 'fliptap/privacy_policy.html' },
                'com.techbysh.cliply': { privacyUrl: 'cliply/privacy_policy.html' },
                'com.techbysh.trackpit': { privacyUrl: 'trackpit/privacy_policy.html' }
            },
            fetchImpl: async (url) => ({
                ok: true,
                status: 200,
                text: async () => pages[url] || ''
            })
        });

        assert.deepEqual(result.apps.map((app) => app.package), [
            'com.techbysh.fliptap',
            'com.techbysh.cliply',
            'com.techbysh.trackpit'
        ]);
        assert.equal(result.apps[0].name, 'FlipTap - Gesture Counter');
        assert.equal(result.apps[1].name, 'Cliply: Clipboard Manager');
        assert.equal(result.apps[2].name, 'Trackpit - Expense Tracker');
        assert.equal(result.apps[2].privacyUrl, 'trackpit/privacy_policy.html');
        assert.equal(result.apps.some((app) => app.package === 'com.other.recommended'), false);
        assert.equal(result.errors.length, 0);
    });

    it('still fetches configured package IDs when developer-page lookup finds nothing', async () => {
        const result = await fetchPublicPlayListings({
            packages: ['com.techbysh.cliply'],
            developerName: 'Techbysh',
            overlays: {
                'com.techbysh.cliply': { privacyUrl: 'cliply/privacy_policy.html' }
            },
            fetchImpl: async (url) => {
                if (url.includes('/developer')) {
                    return { ok: true, status: 200, text: async () => '<html></html>' };
                }
                return {
                    ok: true,
                    status: 200,
                    text: async () => `
                        <meta property="og:title" content="Cliply: Clipboard Manager - Apps on Google Play">
                        <meta property="og:image" content="https://play-lh.googleusercontent.com/cliply-icon">
                        <meta itemprop="description" content="Clipboard manager to save, organize, and quickly access copied text.">
                    `
                };
            }
        });

        assert.equal(result.apps.length, 1);
        assert.equal(result.apps[0].package, 'com.techbysh.cliply');
    });
});
