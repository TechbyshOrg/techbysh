(function ($) {
    'use strict';

    const site = window.TechbyshSite || { mobileApps: [], saasProducts: [], wpAuthor: 'techbysh', contactEmail: 'info@techbysh.com' };
    let loadedPlugins = [];

    function getMobileApps() {
        const listings = Array.isArray(window.TechbyshPlayListings) ? window.TechbyshPlayListings : [];
        const fallback = site.mobileApps || [];
        const byPackage = {};

        fallback.forEach(function (app) {
            if (app && app.package) {
                byPackage[app.package] = app;
            }
        });
        listings.forEach(function (app) {
            if (app && app.package) {
                byPackage[app.package] = app;
            }
        });

        const order = (site.playPackages && site.playPackages.length)
            ? site.playPackages.slice()
            : Object.keys(byPackage);

        listings.concat(fallback).forEach(function (app) {
            if (app && app.package && order.indexOf(app.package) === -1) {
                order.push(app.package);
            }
        });

        return order.map(function (packageName) {
            return byPackage[packageName];
        }).filter(Boolean);
    }

    function getSaasProducts() {
        return site.saasProducts || [];
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function stripHtml(str) {
        const div = document.createElement('div');
        div.innerHTML = str || '';
        return div.textContent || div.innerText || '';
    }

    function skeletonCards(count) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="product-card glass-card skeleton-card" aria-hidden="true">
                    <div class="skeleton skeleton-icon"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-btn"></div>
                </div>`;
        }
        return html;
    }

    function productCard(opts) {
        const { iconUrl, name, description, typeLabel, primaryHref, primaryLabel, secondaryHref, secondaryLabel, iconFit } = opts;
        let secondary = '';
        if (secondaryHref) {
            const external = /^https?:\/\//i.test(secondaryHref);
            const targetAttr = external ? ' target="_blank" rel="noopener"' : '';
            secondary = `<a href="${escapeHtml(secondaryHref)}" class="card-link card-link--muted"${targetAttr}>${escapeHtml(secondaryLabel)}</a>`;
        }
        const iconClass = iconFit === 'contain' ? 'product-icon product-icon--mark' : 'product-icon';

        return `
            <article class="product-card glass-card" data-reveal data-tilt>
                <div class="product-card__top">
                    <div class="${iconClass}">
                        <img src="${escapeHtml(iconUrl)}" alt="" width="72" height="72" loading="lazy" referrerpolicy="no-referrer" />
                    </div>
                    <span class="product-card__badge">${escapeHtml(typeLabel)}</span>
                </div>
                <div class="product-info">
                    <h3>${escapeHtml(name)}</h3>
                    <p>${escapeHtml(description)}</p>
                    <div class="product-actions">
                        <a href="${escapeHtml(primaryHref)}" class="btn btn-outline" target="_blank" rel="noopener">${escapeHtml(primaryLabel)}</a>
                        ${secondary}
                    </div>
                </div>
            </article>`;
    }

    function renderSaasProducts() {
        const apps = getSaasProducts();
        const $section = $('#saas-products-section');
        const $container = $('#saas-products-container');

        if (!apps.length) {
            $section.hide();
            updateProductsVisibility();
            refreshUI();
            return;
        }

        $section.show();
        $container.empty();

        apps.forEach(function (app) {
            let primaryLabel = 'Open product';
            try {
                primaryLabel = 'Visit ' + new URL(app.url).hostname;
            } catch (err) { /* keep fallback */ }

            $container.append(productCard({
                iconUrl: app.icon,
                name: app.name,
                description: app.short_description,
                typeLabel: 'SaaS',
                primaryHref: app.url,
                primaryLabel: primaryLabel,
                iconFit: app.iconFit
            }));
        });

        updateProductsVisibility();
        refreshUI();
    }

    function renderMobileApps() {
        const apps = getMobileApps();
        const $section = $('#mobile-apps-section');
        const $container = $('#mobile-apps-container');

        if (!apps.length) {
            $section.hide();
            updateProductsVisibility();
            refreshUI();
            return;
        }

        $section.show();
        $container.empty();

        apps.forEach(function (app) {
            const playStoreLink = app.playUrl
                || ('https://play.google.com/store/apps/details?id=' + encodeURIComponent(app.package));
            $container.append(productCard({
                iconUrl: app.icon,
                name: app.name,
                description: app.short_description,
                typeLabel: 'Android App',
                primaryHref: playStoreLink,
                primaryLabel: 'Get on Google Play',
                secondaryHref: app.privacyUrl || null,
                secondaryLabel: 'Privacy Policy'
            }));
        });

        updateProductsVisibility();
        refreshUI();
    }

    function renderWordPressPlugins(plugins) {
        loadedPlugins = plugins || [];
        const $section = $('#wp-plugins-section');
        const $container = $('#wp-plugins-container');

        if (!plugins.length) {
            $section.hide();
            updateProductsVisibility();
            refreshUI();
            return;
        }

        $section.show();
        $container.empty();

        plugins.forEach(function (plugin) {
            const iconUrl = (plugin.icons && (plugin.icons['1x'] || plugin.icons['2x'] || plugin.icons.default))
                || 'https://s.w.org/style/images/codeispoetry.png';
            const wpLink = 'https://wordpress.org/plugins/' + plugin.slug + '/';

            $container.append(productCard({
                iconUrl: iconUrl,
                name: stripHtml(plugin.name),
                description: stripHtml(plugin.short_description),
                typeLabel: 'WordPress Plugin',
                primaryHref: wpLink,
                primaryLabel: 'View on WordPress.org'
            }));
        });

        updateProductsVisibility();
        refreshUI();
    }

    function updateProductsVisibility() {
        const hasPlugins = loadedPlugins.length > 0;
        const hasApps = getMobileApps().length > 0;
        const hasSaas = getSaasProducts().length > 0;

        if (!hasPlugins && !hasApps && !hasSaas) {
            $('#products-empty').prop('hidden', false);
        } else {
            $('#products-empty').prop('hidden', true);
        }
    }

    function fetchWordPressPlugins() {
        const $container = $('#wp-plugins-container');
        $container.html(skeletonCards(2));

        $.ajax({
            url: 'https://api.wordpress.org/plugins/info/1.2/',
            dataType: 'jsonp',
            data: {
                action: 'query_plugins',
                request: {
                    author: site.wpAuthor,
                    per_page: 20
                }
            },
            success: function (response) {
                renderWordPressPlugins(response.plugins || []);
            },
            error: function () {
                $('#wp-plugins-container').html(
                    '<p class="section-error" data-reveal>Unable to load WordPress plugins. Please try again later.</p>'
                );
                $('#wp-plugins-section').show();
                loadedPlugins = [];
                updateProductsVisibility();
                refreshUI();
            }
        });
    }

    function refreshUI() {
        if (window.TechbyshUI && window.TechbyshUI.observe) {
            window.TechbyshUI.observe();
        }
    }

    function initContactForm() {
        $('.contact-form').on('submit', function (e) {
            e.preventDefault();
            const form = this;
            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const message = form.message.value.trim();
            const subject = encodeURIComponent('Project inquiry from ' + name);
            const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
            window.location.href = 'mailto:' + site.contactEmail + '?subject=' + subject + '&body=' + body;
        });
    }

    $(document).ready(function () {
        initContactForm();

        $('#saas-products-container').html(skeletonCards(getSaasProducts().length || 1));
        renderSaasProducts();
        $('#mobile-apps-container').html(skeletonCards(getMobileApps().length || 1));
        renderMobileApps();
        fetchWordPressPlugins();
    });
})(jQuery);
