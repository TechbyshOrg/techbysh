export function selectListing(listings, defaultLanguage) {
    if (!Array.isArray(listings) || listings.length === 0) {
        return null;
    }

    return listings.find((listing) => listing.language === defaultLanguage) || listings[0];
}

export function playStoreUrl(packageName) {
    return `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}`;
}

export function mapPlayApp({ packageName, listing, iconUrl, overlay }) {
    return {
        package: packageName,
        name: listing.title,
        short_description: listing.shortDescription,
        icon: iconUrl,
        playUrl: playStoreUrl(packageName),
        privacyUrl: overlay && overlay.privacyUrl ? overlay.privacyUrl : null
    };
}
