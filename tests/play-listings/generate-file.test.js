import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generatePlayListingsJs } from '../../scripts/play-listings/generate-file.js';

describe('generatePlayListingsJs', () => {
    it('writes a browser global the site can load without a bundler', () => {
        const js = generatePlayListingsJs([
            {
                package: 'com.techbysh.fliptap',
                name: 'FlipTap',
                short_description: 'A clean counter app: tap or flip to increase the count.',
                icon: 'https://play-lh.googleusercontent.com/icon.png',
                privacyUrl: '/fliptap/privacy_policy.html'
            }
        ]);

        assert.match(js, /window\.TechbyshPlayListings\s*=/);
        assert.match(js, /com\.techbysh\.fliptap/);
        assert.match(js, /FlipTap/);
        assert.match(js, /privacy_policy\.html/);
    });

    it('never serializes service-account fields into the public file', () => {
        const js = generatePlayListingsJs([
            {
                package: 'com.techbysh.fliptap',
                name: 'FlipTap',
                short_description: 'Short',
                icon: 'https://example.com/icon.png',
                privacyUrl: '/fliptap/privacy_policy.html'
            }
        ], {
            type: 'service_account',
            private_key: '-----BEGIN PRIVATE KEY-----\nsecret\n-----END PRIVATE KEY-----',
            client_email: 'play@project.iam.gserviceaccount.com'
        });

        assert.equal(js.includes('BEGIN PRIVATE KEY'), false);
        assert.equal(js.includes('private_key'), false);
        assert.equal(js.includes('play@project.iam.gserviceaccount.com'), false);
        assert.equal(js.includes('secret'), false);
    });
});
