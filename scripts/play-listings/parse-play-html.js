function decodeHtml(value) {
    return String(value || '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function metaContent(html, attribute, name) {
    const pattern = new RegExp(
        `<meta[^>]+${attribute}="${name}"[^>]*content="([^"]*)"|<meta[^>]+content="([^"]*)"[^>]*${attribute}="${name}"`,
        'i'
    );
    const match = html.match(pattern);
    return decodeHtml((match && (match[1] || match[2])) || '').trim();
}

export function parsePlayDetailsHtml(html, packageName) {
    const rawTitle = metaContent(html, 'property', 'og:title');
    const name = rawTitle.replace(/\s+-\s+Apps on Google Play\s*$/i, '').trim();
    const shortDescription = metaContent(html, 'itemprop', 'description');
    let icon = metaContent(html, 'property', 'og:image');

    if (!name || !shortDescription || !icon) {
        return null;
    }

    if (!/=s\d+/i.test(icon) && !/w\d+-h\d+/i.test(icon)) {
        icon += '=s256-rw';
    }

    return {
        package: packageName,
        name,
        short_description: shortDescription,
        icon,
        playUrl: `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}`
    };
}

export function parsePlayDeveloperHtml(html) {
    const seen = new Set();
    const packages = [];
    const pattern = /\/store\/apps\/details\?id=([a-zA-Z0-9._]+)/g;
    let match;
    while ((match = pattern.exec(html))) {
        const packageName = match[1];
        if (!seen.has(packageName)) {
            seen.add(packageName);
            packages.push(packageName);
        }
    }
    return packages;
}
