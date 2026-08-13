import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { credentialsFromEnv, hasPlayPublisherCredentials, loadPlayConfig, loadServiceAccount } from '../../scripts/play-listings/config.js';

describe('loadPlayConfig', () => {
    it('requires an explicit package-name allowlist', () => {
        assert.throws(
            () => loadPlayConfig({ packages: [] }),
            /package name/i
        );
        assert.throws(
            () => loadPlayConfig({}),
            /package name/i
        );
    });

    it('returns packages and overlays from the owner config', () => {
        const config = loadPlayConfig({
            developerName: 'Techbysh',
            packages: ['com.techbysh.fliptap', 'com.techbysh.cliply'],
            overlays: {
                'com.techbysh.fliptap': { privacyUrl: '/fliptap/privacy_policy.html' }
            }
        });

        assert.deepEqual(config.packages, ['com.techbysh.fliptap', 'com.techbysh.cliply']);
        assert.equal(config.developerName, 'Techbysh');
        assert.equal(config.overlays['com.techbysh.fliptap'].privacyUrl, '/fliptap/privacy_policy.html');
    });

    it('does not treat a developer name as Publisher API credentials', () => {
        assert.equal(hasPlayPublisherCredentials({}), false);
        assert.equal(hasPlayPublisherCredentials({ GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: '  ' }), false);
        assert.equal(hasPlayPublisherCredentials({
            GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify({ type: 'service_account' })
        }), true);
    });
});

describe('loadServiceAccount', () => {
    it('parses JSON from GOOGLE_PLAY_SERVICE_ACCOUNT_JSON', () => {
        const credentials = loadServiceAccount({
            GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify({
                type: 'service_account',
                client_email: 'play@project.iam.gserviceaccount.com',
                private_key: '-----BEGIN PRIVATE KEY-----\nsecret\n-----END PRIVATE KEY-----'
            })
        });

        assert.equal(credentials.type, 'service_account');
        assert.equal(credentials.client_email, 'play@project.iam.gserviceaccount.com');
    });

    it('throws a safe authentication error when the JSON is missing or invalid', () => {
        assert.throws(
            () => loadServiceAccount({}),
            /service account/i
        );
        assert.throws(
            () => loadServiceAccount({ GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: '{not-json' }),
            /service account/i
        );
    });

    it('does not include the private key in thrown error messages', () => {
        try {
            loadServiceAccount({
                GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: '{"private_key":"-----BEGIN PRIVATE KEY-----\\nsecret\\n-----END PRIVATE KEY-----",'
            });
            assert.fail('expected throw');
        } catch (error) {
            assert.equal(String(error).includes('BEGIN PRIVATE KEY'), false);
            assert.equal(String(error).includes('secret'), false);
        }
    });

    it('reads GOOGLE_APPLICATION_CREDENTIALS from a file path', () => {
        const credentials = credentialsFromEnv(
            { GOOGLE_APPLICATION_CREDENTIALS: 'C:\\secrets\\play.json' },
            (filePath) => {
                assert.equal(filePath, 'C:\\secrets\\play.json');
                return JSON.stringify({
                    type: 'service_account',
                    client_email: 'play@project.iam.gserviceaccount.com',
                    private_key: '-----BEGIN PRIVATE KEY-----\nsecret\n-----END PRIVATE KEY-----'
                });
            }
        );

        assert.equal(credentials.client_email, 'play@project.iam.gserviceaccount.com');
    });
});
