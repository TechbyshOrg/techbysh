export function loadPlayConfig(raw) {
    const packages = raw && Array.isArray(raw.packages) ? raw.packages.filter(Boolean) : [];
    if (packages.length === 0) {
        throw new Error('play-listings.config.json must list at least one package name / application ID. A Google Play developer ID is not enough.');
    }

    return {
        packages,
        developerName: raw.developerName ? String(raw.developerName).trim() : null,
        overlays: raw.overlays && typeof raw.overlays === 'object' ? raw.overlays : {}
    };
}

export function hasPlayPublisherCredentials(env) {
    return Boolean(
        (env && env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON && String(env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON).trim())
        || (env && env.GOOGLE_APPLICATION_CREDENTIALS)
    );
}

export function loadServiceAccount(env) {
    const json = env && env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    if (!json || !String(json).trim()) {
        throw new Error('A Google Play service account is required. Set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.');
    }

    try {
        const credentials = JSON.parse(json);
        if (!credentials || credentials.type !== 'service_account') {
            throw new Error('not a service account');
        }
        return credentials;
    } catch {
        throw new Error('A Google Play service account is required. The provided JSON could not be parsed.');
    }
}

export function credentialsFromEnv(env, readFileSync) {
    if (env && env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON) {
        return loadServiceAccount(env);
    }

    if (env && env.GOOGLE_APPLICATION_CREDENTIALS) {
        const json = readFileSync(env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
        return loadServiceAccount({ GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: json });
    }

    return loadServiceAccount(env);
}
