import { classifyPlayError } from './classify-error.js';
import { mapPlayApp, selectListing } from './map-listing.js';

const MAX_ATTEMPTS = 3;

function defaultSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(fn, sleep) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const classified = classifyPlayError(error);
            if (!classified.retryable || attempt === MAX_ATTEMPTS) {
                throw error;
            }
            await sleep(250 * attempt);
        }
    }
    throw lastError;
}

async function fetchOneApp({ client, packageName, overlay, sleep }) {
    let editId = null;
    try {
        const edit = await withRetry(() => client.insertEdit(packageName), sleep);
        editId = edit.id;

        const details = await withRetry(() => client.getDetails(packageName, editId), sleep);
        const listingResponse = await withRetry(() => client.listListings(packageName, editId), sleep);
        const listing = selectListing(listingResponse.listings, details && details.defaultLanguage);
        if (!listing || !listing.title) {
            const error = new Error('Localized store listing is missing a title');
            error.code = 400;
            throw error;
        }

        const images = await withRetry(
            () => client.listImages(packageName, editId, listing.language, 'icon'),
            sleep
        );
        const iconUrl = images && images.images && images.images[0] && images.images[0].url;
        if (!iconUrl) {
            const error = new Error('Store listing icon is missing');
            error.code = 400;
            throw error;
        }

        return mapPlayApp({ packageName, listing, iconUrl, overlay });
    } finally {
        if (editId) {
            try {
                await client.deleteEdit(packageName, editId);
            } catch {
                // Read-only fetch should not fail the job if abandon is already gone.
            }
        }
    }
}

export async function fetchPlayListings({
    client,
    packages,
    overlays = {},
    discover = false,
    sleep = defaultSleep
}) {
    const configured = Array.isArray(packages) ? packages.filter(Boolean) : [];
    if (configured.length === 0) {
        throw new Error('A package name / application ID is required. Google Play developer ID is not enough to fetch or update listings.');
    }

    if (discover && typeof client.searchAccessibleApps === 'function') {
        await client.searchAccessibleApps();
    }

    const apps = [];
    const errors = [];

    for (const packageName of configured) {
        try {
            const app = await fetchOneApp({
                client,
                packageName,
                overlay: overlays[packageName],
                sleep
            });
            apps.push(app);
        } catch (error) {
            const classified = classifyPlayError(error);
            errors.push({
                packageName,
                type: classified.type,
                message: classified.message
            });
        }
    }

    return { apps, errors };
}
