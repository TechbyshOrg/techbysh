/**
 * Single source of truth for Techbysh mobile app products.
 * Only add apps that are published under com.techbysh.* on Google Play.
 */
window.TechbyshSite = {
    contactEmail: 'info@techbysh.com',
    wpAuthor: 'techbysh',
    mobileApps: [
        {
            name: 'FlipTap',
            package: 'com.techbysh.fliptap',
            icon: 'https://play-lh.googleusercontent.com/niDChuoHvXITu2zK6xS-nCJ-wccPM0cHiRgKOeiZTiq68H9TlLNIamw3raVqNGKyzeSWxtR0x36DJGMTgmHHYA=w480-h960-rw',
            short_description: 'A clean counter app: tap or flip to increase the count.',
            privacyUrl: '/fliptap/privacy_policy.html',
            category: 'mobile'
        },
        {
            name: 'Cliply - Clipboard Manager',
            package: 'com.techbysh.cliply',
            icon: 'https://play-lh.googleusercontent.com/t5h8U8Hrns_w0yY0FuxdvXqU30kV1B-ZzqaLgoASypMeg5jHr51s_Jh9Qgtx86rdoMsjFLdCqLaqJTyDdbfa=w240-h480-rw',
            short_description: 'Manage your clipboard history with ease.',
            privacyUrl: '/cliply/privacy_policy.html',
            category: 'mobile'
        }
    ]
};
