import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapPlayApp, selectListing } from '../../scripts/play-listings/map-listing.js';

describe('selectListing', () => {
    it('prefers the app default language over other locales', () => {
        const listings = [
            { language: 'de-DE', title: 'German', shortDescription: 'Kurz', fullDescription: 'Lang' },
            { language: 'en-US', title: 'FlipTap', shortDescription: 'A clean counter app', fullDescription: 'Full' }
        ];

        const listing = selectListing(listings, 'en-US');

        assert.equal(listing.language, 'en-US');
        assert.equal(listing.title, 'FlipTap');
    });

    it('falls back to the first listing when the default language is missing', () => {
        const listings = [
            { language: 'hi-IN', title: 'FlipTap HI', shortDescription: 'Short', fullDescription: 'Full' }
        ];

        const listing = selectListing(listings, 'en-US');

        assert.equal(listing.language, 'hi-IN');
    });

    it('returns null when no listings exist', () => {
        assert.equal(selectListing([], 'en-US'), null);
        assert.equal(selectListing(undefined, 'en-US'), null);
    });
});

describe('mapPlayApp', () => {
    it('maps official listing fields and overlay privacy URL into a site card', () => {
        const card = mapPlayApp({
            packageName: 'com.techbysh.fliptap',
            listing: {
                language: 'en-US',
                title: 'FlipTap',
                shortDescription: 'A clean counter app: tap or flip to increase the count.',
                fullDescription: 'Full listing copy',
                video: 'https://www.youtube.com/watch?v=dQw4w9wgGcQ'
            },
            iconUrl: 'https://play-lh.googleusercontent.com/icon.png',
            overlay: { privacyUrl: '/fliptap/privacy_policy.html' }
        });

        assert.deepEqual(card, {
            package: 'com.techbysh.fliptap',
            name: 'FlipTap',
            short_description: 'A clean counter app: tap or flip to increase the count.',
            icon: 'https://play-lh.googleusercontent.com/icon.png',
            playUrl: 'https://play.google.com/store/apps/details?id=com.techbysh.fliptap',
            privacyUrl: '/fliptap/privacy_policy.html'
        });
    });

    it('omits privacyUrl when the overlay does not provide one', () => {
        const card = mapPlayApp({
            packageName: 'com.techbysh.cliply',
            listing: { title: 'Cliply', shortDescription: 'Clipboard manager' },
            iconUrl: 'https://example.com/icon.png'
        });

        assert.equal(card.privacyUrl, null);
        assert.equal(card.name, 'Cliply');
    });

    it('does not copy credential material onto the card', () => {
        const card = mapPlayApp({
            packageName: 'com.techbysh.fliptap',
            listing: { title: 'FlipTap', shortDescription: 'Short' },
            iconUrl: 'https://example.com/icon.png',
            overlay: { privacyUrl: '/fliptap/privacy_policy.html' },
            credentials: { private_key: '-----BEGIN PRIVATE KEY-----\nsecret\n-----END PRIVATE KEY-----' }
        });

        assert.equal(JSON.stringify(card).includes('BEGIN PRIVATE KEY'), false);
        assert.equal(JSON.stringify(card).includes('secret'), false);
    });
});
