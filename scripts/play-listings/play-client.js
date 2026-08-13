export function createPlayClient(api) {
    return {
        insertEdit(packageName) {
            return api.edits.insert({ packageName }).then((res) => res.data);
        },
        getDetails(packageName, editId) {
            return api.edits.details.get({ packageName, editId }).then((res) => res.data);
        },
        listListings(packageName, editId) {
            return api.edits.listings.list({ packageName, editId }).then((res) => res.data);
        },
        listImages(packageName, editId, language, imageType) {
            return api.edits.images.list({ packageName, editId, language, imageType }).then((res) => res.data);
        },
        deleteEdit(packageName, editId) {
            return api.edits.delete({ packageName, editId }).then((res) => res.data);
        }
    };
}
