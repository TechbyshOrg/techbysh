/**
 * Read public Play Store HTML from Node/CI.
 * GitHub Pages cannot call play.google.com from the browser (no public JSON API, CORS).
 * The official Android Publisher API also cannot list apps by developer name; it needs
 * package IDs and a service account, which must not ship in the static site.
 */
import { parsePlayDetailsHtml, parsePlayDeveloperHtml } from './parse-play-html.js';

const PLAY_ORIGIN = 'https://play.google.com';

function detailsUrl(packageName) {
    return `${PLAY_ORIGIN}/store/apps/details?id=${encodeURIComponent(packageName)}&hl=en&gl=US`;
}

function developerUrl(developerName) {
    return `${PLAY_ORIGIN}/store/apps/developer?id=${encodeURIComponent(developerName)}&hl=en&gl=US`;
}

async function readPage(fetchImpl, url) {
    const response = await fetchImpl(url, {
        headers: { 'user-agent': 'Mozilla/5.0 TechbyshPlaySync/1.0' }
    });
    if (!response || !response.ok) {
        const error = new Error(`Play Store request failed (${response && response.status})`);
        error.code = response && response.status;
        throw error;
    }
    return response.text();
}

export async function fetchPublicPlayListings({
    packages = [],
    developerName,
    overlays = {},
    fetchImpl = fetch
} = {}) {
    const configured = Array.isArray(packages) ? packages.filter(Boolean) : [];
    const ordered = [...configured];
    const errors = [];

    if (developerName) {
        try {
            const html = await readPage(fetchImpl, developerUrl(developerName));
            for (const packageName of parsePlayDeveloperHtml(html)) {
                if (!packageName.startsWith('com.techbysh.')) {
                    continue;
                }
                if (!ordered.includes(packageName)) {
                    ordered.push(packageName);
                }
            }
        } catch (error) {
            errors.push({
                packageName: developerName,
                type: 'developer_lookup',
                message: error.message || 'Could not read the public Play developer page.'
            });
        }
    }

    if (ordered.length === 0) {
        throw new Error('A package name / application ID is required. Google Play developer name alone is not a public catalog API.');
    }

    const apps = [];
    for (const packageName of ordered) {
        try {
            const html = await readPage(fetchImpl, detailsUrl(packageName));
            const listing = parsePlayDetailsHtml(html, packageName);
            if (!listing) {
                throw new Error('Public Play listing did not include a title, short description, and icon.');
            }
            const overlay = overlays[packageName] || {};
            apps.push({
                ...listing,
                privacyUrl: overlay.privacyUrl || null
            });
        } catch (error) {
            errors.push({
                packageName,
                type: 'not_found',
                message: error.message || 'App listing is not accessible.'
            });
        }
    }

    return { apps, errors };
}
