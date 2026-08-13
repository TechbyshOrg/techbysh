import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parsePlayDetailsHtml, parsePlayDeveloperHtml } from '../../scripts/play-listings/parse-play-html.js';

const fliptapHtml = `
<html>
  <meta property="og:title" content="FlipTap - Gesture Counter - Apps on Google Play">
  <meta property="og:image" content="https://play-lh.googleusercontent.com/f7eZ_ShYHvYsHWSo8qJHA8lqNohaD5cbtkRN4W6udCobRoSHvZKN-PWOM3c1nfUIZVfsOnaQUaEtDOzKISS4cw">
  <meta itemprop="description" content="Tally counts with gestures, screen taps, or a floating window over other apps.">
</html>
`;

const developerHtml = `
<a href="/store/apps/details?id=com.techbysh.trackpit">Trackpit</a>
<a href="/store/apps/details?id=com.techbysh.cliply">Cliply</a>
<a href="/store/apps/details?id=com.techbysh.fliptap">FlipTap</a>
<a href="/store/apps/details?id=com.techbysh.fliptap">FlipTap again</a>
`;

describe('parsePlayDetailsHtml', () => {
    it('reads the public Play listing title, short description, and icon', () => {
        const listing = parsePlayDetailsHtml(fliptapHtml, 'com.techbysh.fliptap');

        assert.equal(listing.package, 'com.techbysh.fliptap');
        assert.equal(listing.name, 'FlipTap - Gesture Counter');
        assert.equal(listing.short_description, 'Tally counts with gestures, screen taps, or a floating window over other apps.');
        assert.match(listing.icon, /play-lh\.googleusercontent\.com/);
        assert.equal(listing.playUrl, 'https://play.google.com/store/apps/details?id=com.techbysh.fliptap');
    });

    it('returns null when the page is not a valid listing', () => {
        assert.equal(parsePlayDetailsHtml('<html><title>Not Found</title></html>', 'com.missing.app'), null);
    });
});

describe('parsePlayDeveloperHtml', () => {
    it('collects unique package names from a public developer page', () => {
        assert.deepEqual(parsePlayDeveloperHtml(developerHtml), [
            'com.techbysh.trackpit',
            'com.techbysh.cliply',
            'com.techbysh.fliptap'
        ]);
    });
});
