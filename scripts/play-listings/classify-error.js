function statusCode(error) {
    return error && (error.code || (error.response && error.response.status));
}

function errorText(error) {
    const parts = [error && error.message];
    const reasons = error && Array.isArray(error.errors)
        ? error.errors.map((item) => item.reason || item.message)
        : [];
    return [parts, reasons].flat().filter(Boolean).join(' ').toLowerCase();
}

export function classifyPlayError(error) {
    const code = Number(statusCode(error));
    const text = errorText(error);

    if (code === 401) {
        return { type: 'authentication', retryable: false, message: 'Authentication failed. Check the service account credentials.' };
    }

    if (code === 403) {
        return { type: 'permission', retryable: false, message: 'Insufficient Play Console permission for this app.' };
    }

    if (code === 404) {
        return { type: 'not_found', retryable: false, message: 'Package name is invalid or the app is not accessible to this account.' };
    }

    if (code === 409) {
        return { type: 'conflict', retryable: true, message: 'Concurrent edit conflict. Retry with a fresh edit.' };
    }

    if (code === 429) {
        return { type: 'rate_limit', retryable: true, message: 'Google Play API rate limit reached. Retry with backoff.' };
    }

    if (text.includes('changes_already_in_review') || text.includes('already have changes in review')) {
        return { type: 'review_conflict', retryable: false, message: 'Play already has changes in review. Wait or resolve them in Play Console.' };
    }

    if (code === 400 && /image|png|jpeg|screenshot|icon|graphic/.test(text)) {
        return { type: 'invalid_image', retryable: false, message: error.message || 'Invalid listing image.' };
    }

    if (code === 400) {
        return { type: 'invalid_listing', retryable: false, message: error.message || 'Invalid listing data.' };
    }

    if (code >= 500) {
        return { type: 'server', retryable: true, message: 'Google Play API server error. Retry with backoff.' };
    }

    return { type: 'unknown', retryable: false, message: (error && error.message) || 'Unknown Google Play API error.' };
}
