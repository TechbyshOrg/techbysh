export function generatePlayListingsJs(apps) {
    const payload = JSON.stringify(apps, null, 4);
    return [
        '/**',
        ' * Generated Google Play store listing cards.',
        ' * Refresh with: npm run sync:play (public Play pages by package ID).',
        ' * Do not put service-account credentials in this file.',
        ' */',
        `window.TechbyshPlayListings = ${payload};`,
        ''
    ].join('\n');
}
