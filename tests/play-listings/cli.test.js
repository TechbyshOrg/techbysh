import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { syncPlayListings } from '../../scripts/play-listings/cli.js';

function fakeApi() {
    return {
        edits: {
            insert: async ({ packageName }) => ({ data: { id: `edit-${packageName}` } }),
            delete: async () => ({ data: {} }),
            details: {
                get: async () => ({ data: { defaultLanguage: 'en-US' } })
            },
            listings: {
                list: async ({ packageName }) => ({
                    data: {
                        listings: [{
                            language: 'en-US',
                            title: packageName === 'com.techbysh.cliply' ? 'Cliply - Clipboard Manager' : 'FlipTap',
                            shortDescription: 'Synced from Play'
                        }]
                    }
                })
            },
            images: {
                list: async () => ({
                    data: { images: [{ id: '1', url: 'https://play-lh.googleusercontent.com/live-icon.png' }] }
                })
            }
        }
    };
}

describe('syncPlayListings', () => {
    it('writes public listing cards and never writes the service account key', async () => {
        const writes = [];
        const errors = [];
        const result = await syncPlayListings({
            env: {
                GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify({
                    type: 'service_account',
                    private_key: '-----BEGIN PRIVATE KEY-----\nSECRETKEY\n-----END PRIVATE KEY-----',
                    client_email: 'play@project.iam.gserviceaccount.com'
                })
            },
            createApi: fakeApi,
            writeFileSync: (file, contents) => writes.push({ file, contents }),
            log() {},
            error: (message) => errors.push(message)
        });

        assert.equal(result.apps.length, 3);
        assert.equal(writes.length, 1);
        assert.match(writes[0].file, /play-listings\.js$/);
        assert.match(writes[0].contents, /window\.TechbyshPlayListings/);
        assert.match(writes[0].contents, /Synced from Play/);
        assert.equal(writes[0].contents.includes('SECRETKEY'), false);
        assert.equal(writes[0].contents.includes('BEGIN PRIVATE KEY'), false);
        assert.equal(writes[0].contents.includes('play@project.iam.gserviceaccount.com'), false);
        assert.equal(errors.length, 0);
    });

    it('fetches public Play listings by package ID when Publisher API credentials are not set', async () => {
        const writes = [];
        const logs = [];
        const result = await syncPlayListings({
            env: {},
            writeFileSync: (file, contents) => writes.push({ file, contents }),
            log: (message) => logs.push(message),
            error() {},
            fetchImpl: async (url) => {
                const pages = {
                    'https://play.google.com/store/apps/developer?id=Techbysh&hl=en&gl=US': `
                        <a href="/store/apps/details?id=com.techbysh.trackpit"></a>
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
                return {
                    ok: true,
                    status: 200,
                    text: async () => pages[url] || ''
                };
            }
        });

        assert.equal(result.apps.length, 3);
        assert.equal(result.apps[0].name, 'FlipTap - Gesture Counter');
        assert.equal(result.apps[1].name, 'Cliply: Clipboard Manager');
        assert.equal(result.apps[2].package, 'com.techbysh.trackpit');
        assert.match(writes[0].contents, /Cliply: Clipboard Manager/);
        assert.match(writes[0].contents, /Trackpit - Expense Tracker/);
        assert.match(logs.join('\n'), /public Google Play listings/i);
    });
});
