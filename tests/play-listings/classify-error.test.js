import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyPlayError } from '../../scripts/play-listings/classify-error.js';

describe('classifyPlayError', () => {
    it('maps 401 to authentication failure', () => {
        const classified = classifyPlayError({ code: 401, message: 'Invalid Credentials' });
        assert.equal(classified.type, 'authentication');
        assert.match(classified.message, /authentication/i);
    });

    it('maps 403 to insufficient permissions', () => {
        const classified = classifyPlayError({ code: 403, message: 'The caller does not have permission' });
        assert.equal(classified.type, 'permission');
        assert.match(classified.message, /permission/i);
    });

    it('maps 404 to inaccessible or invalid package name', () => {
        const classified = classifyPlayError({ code: 404, message: 'Package not found' });
        assert.equal(classified.type, 'not_found');
        assert.match(classified.message, /package/i);
    });

    it('maps 409 to concurrent edit conflict', () => {
        const classified = classifyPlayError({ code: 409, message: 'Edit conflict' });
        assert.equal(classified.type, 'conflict');
        assert.match(classified.message, /edit/i);
    });

    it('maps 429 to rate limit', () => {
        const classified = classifyPlayError({ code: 429, message: 'Quota exceeded' });
        assert.equal(classified.type, 'rate_limit');
        assert.match(classified.message, /rate limit/i);
    });

    it('maps CHANGES_ALREADY_IN_REVIEW to a review conflict', () => {
        const classified = classifyPlayError({
            code: 400,
            message: 'You already have changes in review',
            errors: [{ reason: 'CHANGES_ALREADY_IN_REVIEW' }]
        });
        assert.equal(classified.type, 'review_conflict');
    });

    it('maps 400 listing validation failures separately from image failures', () => {
        const listing = classifyPlayError({
            code: 400,
            message: 'Title is too long'
        });
        assert.equal(listing.type, 'invalid_listing');

        const image = classifyPlayError({
            code: 400,
            message: 'Invalid image: expected PNG'
        });
        assert.equal(image.type, 'invalid_image');
    });

    it('maps 5xx to retryable server errors', () => {
        const classified = classifyPlayError({ code: 503, message: 'backendError' });
        assert.equal(classified.type, 'server');
        assert.equal(classified.retryable, true);
    });

    it('reads status from gaxios-style response objects', () => {
        const classified = classifyPlayError({
            response: { status: 403 },
            message: 'Forbidden'
        });
        assert.equal(classified.type, 'permission');
    });
});
