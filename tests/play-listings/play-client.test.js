import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPlayClient } from '../../scripts/play-listings/play-client.js';

describe('createPlayClient', () => {
    it('reads listings and icons through the official Android Publisher edits resources', async () => {
        const calls = [];
        const api = {
            edits: {
                insert: async (params) => {
                    calls.push(['insert', params]);
                    return { data: { id: 'edit-1' } };
                },
                delete: async (params) => {
                    calls.push(['delete', params]);
                    return { data: {} };
                },
                details: {
                    get: async (params) => {
                        calls.push(['details.get', params]);
                        return { data: { defaultLanguage: 'en-US' } };
                    }
                },
                listings: {
                    list: async (params) => {
                        calls.push(['listings.list', params]);
                        return { data: { listings: [{ language: 'en-US', title: 'FlipTap' }] } };
                    }
                },
                images: {
                    list: async (params) => {
                        calls.push(['images.list', params]);
                        return { data: { images: [{ id: '1', url: 'https://example.com/icon.png' }] } };
                    }
                }
            }
        };

        const client = createPlayClient(api);

        assert.deepEqual(await client.insertEdit('com.techbysh.fliptap'), { id: 'edit-1' });
        assert.deepEqual(await client.getDetails('com.techbysh.fliptap', 'edit-1'), { defaultLanguage: 'en-US' });
        assert.equal((await client.listListings('com.techbysh.fliptap', 'edit-1')).listings[0].title, 'FlipTap');
        assert.equal((await client.listImages('com.techbysh.fliptap', 'edit-1', 'en-US', 'icon')).images[0].url, 'https://example.com/icon.png');
        await client.deleteEdit('com.techbysh.fliptap', 'edit-1');

        assert.deepEqual(calls[4], ['delete', { packageName: 'com.techbysh.fliptap', editId: 'edit-1' }]);
        assert.equal(calls[3][1].imageType, 'icon');
    });
});
