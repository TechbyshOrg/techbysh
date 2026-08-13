import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('GitHub Pages static compatibility', () => {
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const siteData = fs.readFileSync(path.join(root, 'js/site-data.js'), 'utf8');

    it('includes Job Assistant as a first-class product, not a one-off banner', () => {
        assert.match(html, /id="saas-products-section"/);
        assert.match(html, />SaaS</);
        assert.match(html, /jobassistant\.online/);
        assert.match(siteData, /AI Job Assistant/);
        assert.match(siteData, /https:\/\/jobassistant\.online/);
        assert.match(siteData, /images\/job-assistant\.svg/);
    });

    it('keeps CSS, JS, and images on relative GitHub Pages-safe paths', () => {
        assert.match(html, /href="css\/style\.css"/);
        assert.match(html, /src="js\/main\.js"/);
        assert.match(html, /href="\.\/"/);
        assert.equal(/href="\/css\//.test(html), false);
        assert.equal(/src="\/js\//.test(html), false);
        assert.equal(/href="\/fliptap\//.test(html), false);
        assert.equal(/href="\/cliply\//.test(html), false);
        assert.equal(/href="\/trackpit\//.test(html), false);
        assert.match(html, /trackpit\/privacy_policy\.html/);
    });

    it('ships the Job Assistant icon as a static file', () => {
        assert.equal(fs.existsSync(path.join(root, 'images/job-assistant.svg')), true);
    });

    it('does not trap the mobile nav inside a header containing block', () => {
        const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
        const headerBlock = css.match(/\/\* Header \*\/\s*\.header \{([^}]+)\}/);
        const shellBlock = css.match(/\.header__shell \{([^}]+)\}/);

        assert.ok(headerBlock, 'expected a base .header rule');
        assert.ok(shellBlock, 'expected a base .header__shell rule');
        assert.equal(/transform\s*:/.test(headerBlock[1]), false);
        assert.equal(/backdrop-filter\s*:/.test(shellBlock[1]), false);
        assert.match(css, /\.header__shell::before \{[\s\S]*backdrop-filter:/);
        assert.match(css, /\.main-nav \{\s*position:\s*fixed;/);
    });

    it('keeps Play listings on package IDs instead of a browser Play Store fetch', () => {
        const main = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
        assert.match(siteData, /playPackages/);
        assert.match(siteData, /com\.techbysh\.fliptap/);
        assert.match(siteData, /com\.techbysh\.cliply/);
        assert.match(siteData, /com\.techbysh\.trackpit/);
        assert.equal(/play\.google\.com\/store\/apps\/developer/.test(main), false);
        assert.equal(/api\.wordpress\.org/.test(main), true);
    });
});
