/**
 * Owner-side product config for Techbysh.
 * WordPress plugins are fetched live from WordPress.org by wpAuthor.
 * Google Play cards prefer js/play-listings.js (refreshed by npm run sync:play).
 * playPackages is the allowlist of application IDs. Google Play has no public
 * developer-name catalog API, so package IDs are required.
 * mobileApps remains a fallback if generated Play listings are unavailable.
 */
window.TechbyshSite = {
    contactEmail: 'info@techbysh.com',
    wpAuthor: 'techbysh',
    playDeveloper: 'Techbysh',
    playPackages: [
        'com.techbysh.fliptap',
        'com.techbysh.cliply',
        'com.techbysh.trackpit'
    ],
    saasProducts: [
        {
            name: 'AI Job Assistant',
            url: 'https://jobassistant.online',
            icon: 'images/job-assistant.svg',
            short_description: 'Check how well your resume matches a job, then generate tailored resumes, cover letters, and recruiter messages.',
            iconFit: 'contain'
        }
    ],
    mobileApps: [
        {
            name: 'FlipTap - Gesture Counter',
            package: 'com.techbysh.fliptap',
            playUrl: 'https://play.google.com/store/apps/details?id=com.techbysh.fliptap',
            icon: 'https://play-lh.googleusercontent.com/f7eZ_ShYHvYsHWSo8qJHA8lqNohaD5cbtkRN4W6udCobRoSHvZKN-PWOM3c1nfUIZVfsOnaQUaEtDOzKISS4cw=s256-rw',
            short_description: 'Tally counts with gestures, screen taps, or a floating window over other apps.',
            privacyUrl: 'fliptap/privacy_policy.html',
            category: 'mobile'
        },
        {
            name: 'Cliply: Clipboard Manager',
            package: 'com.techbysh.cliply',
            playUrl: 'https://play.google.com/store/apps/details?id=com.techbysh.cliply',
            icon: 'https://play-lh.googleusercontent.com/yTv9rFNcilfcAJVxqnqB-2owaLYsMOiv6TIiNqunQ4jaHulYd4yvnPYKkcXOJWXIO1jZAoGhEykdP6_dPaSH9cs=s256-rw',
            short_description: 'Clipboard manager to save, organize, and quickly access copied text.',
            privacyUrl: 'cliply/privacy_policy.html',
            category: 'mobile'
        },
        {
            name: 'Trackpit - Expense Tracker',
            package: 'com.techbysh.trackpit',
            playUrl: 'https://play.google.com/store/apps/details?id=com.techbysh.trackpit',
            icon: 'https://play-lh.googleusercontent.com/nXHwTH5r97wDLxmwluOkSwtWZeIUxVx4l8mcPNOefFiYTVVIIvXNw425D3-qgft-ZBEqpbweAWZvWPBaiFb8xA=s256-rw',
            short_description: 'Scan, categorize, pay, and track every UPI expense instantly.',
            privacyUrl: 'trackpit/privacy_policy.html',
            category: 'mobile'
        }
    ]
};
