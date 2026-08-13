import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { credentialsFromEnv, hasPlayPublisherCredentials, loadPlayConfig } from './config.js';
import { fetchPlayListings } from './fetch-listings.js';
import { generatePlayListingsJs } from './generate-file.js';
import { createPlayClient } from './play-client.js';
import { fetchPublicPlayListings } from './public-fetch.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'play-listings.config.json');
const outputPath = path.join(rootDir, 'js/play-listings.js');

function readConfigFile() {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return loadPlayConfig(raw);
}

async function fetchOfficialListings({ config, env, readFileSync, createApi }) {
    const credentials = credentialsFromEnv(env, readFileSync);
    const googleApiFactory = createApi || (await import('./google-api.js')).createGooglePlayApi;
    const client = createPlayClient(googleApiFactory(credentials));
    return fetchPlayListings({
        client,
        packages: config.packages,
        overlays: config.overlays
    });
}

function fetchPublicListings(config, fetchImpl) {
    return fetchPublicPlayListings({
        packages: config.packages,
        developerName: config.developerName,
        overlays: config.overlays,
        fetchImpl
    });
}

export async function syncPlayListings({
    env = process.env,
    readFileSync = fs.readFileSync,
    writeFileSync = fs.writeFileSync,
    log = console.log,
    error = console.error,
    createApi,
    fetchImpl
} = {}) {
    const config = readConfigFile();
    const hasPublisherCreds = hasPlayPublisherCredentials(env);
    const useOfficial = typeof createApi === 'function'
        || (hasPublisherCreds && env.PLAY_USE_PUBLISHER_API === 'true');

    let result;
    if (useOfficial) {
        try {
            result = await fetchOfficialListings({ config, env, readFileSync, createApi });
            if (result.apps.length === 0) {
                throw new Error('Publisher API returned no listings.');
            }
        } catch (err) {
            error(`Publisher API failed (${err.message}). Falling back to public Play Store listings.`);
            result = await fetchPublicListings(config, fetchImpl);
        }
    } else {
        log('Fetching public Google Play listings by package ID. The official Publisher API is optional and is not used without PLAY_USE_PUBLISHER_API.');
        result = await fetchPublicListings(config, fetchImpl);
        if (result.apps.length === 0 && hasPublisherCreds) {
            log('Public listings were empty. Trying the official Publisher API.');
            result = await fetchOfficialListings({ config, env, readFileSync, createApi });
        }
    }

    if (result.apps.length > 0) {
        writeFileSync(outputPath, generatePlayListingsJs(result.apps), 'utf8');
        log(`Synced ${result.apps.length} Google Play listing(s) to js/play-listings.js`);
    }

    for (const item of result.errors) {
        error(`${item.packageName}: ${item.type} — ${item.message}`);
    }

    if (result.apps.length === 0) {
        throw new Error('No Google Play listings were synced. Check package names and Play Store availability.');
    }

    return result;
}

const isCli = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
    syncPlayListings().catch((error) => {
        console.error(error.message || 'Google Play listing sync failed.');
        process.exitCode = 1;
    });
}
