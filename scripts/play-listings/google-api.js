import { google } from 'googleapis';

const ANDROID_PUBLISHER_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

export function createGooglePlayApi(credentials) {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [ANDROID_PUBLISHER_SCOPE]
    });
    return google.androidpublisher({ version: 'v3', auth });
}
