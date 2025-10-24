$(document).ready(function() {
    const apps = [
        {
            name: "FlipTap",
            package: "com.techbysh.fliptap",
            icon: "https://play-lh.googleusercontent.com/niDChuoHvXITu2zK6xS-nCJ-wccPM0cHiRgKOeiZTiq68H9TlLNIamw3raVqNGKyzeSWxtR0x36DJGMTgmHHYA=w480-h960-rw",
            short_description: "A clean counter app: tap or flip to increase the count."
        }
    ];

    const $container = $('#mobile-apps-container');
    $container.empty();

    apps.forEach(app => {
        const playStoreLink = `https://play.google.com/store/apps/details?id=${app.package}`;
        const card = `
            <div class="product-card animate-fade-in">
                <div class="product-icon" style="background-color: rgba(255,0,0,0.05); padding:10px;">
                    <img src="${app.icon}" alt="${app.name}" width="65" height="65" style="border-radius:2px;" />
                </div>
                <div class="product-info">
                    <h3>${app.name}</h3>
                    <p>${app.short_description}</p>
                    <a href="${playStoreLink}" class="btn btn-outline" target="_blank" rel="noopener">
                        get it on Google Play
                    </a>
                </div>
            </div>
        `;
        $container.append(card);
    });


    $(document).ready(function () {
        $.ajax({
            url: "https://api.wordpress.org/plugins/info/1.2/",
            dataType: "jsonp",
            data: {
                action: "query_plugins",
                request: {
                    author: "techbysh",
                    per_page: 10
                }
            },
            success: function (response) {
                const plugins = response.plugins || [];
                const $container = $('#wp-plugins-container');

                $container.empty();

                if (plugins.length === 0) {
                    $container.append('<p>No plugins found for this author.</p>');
                } else {
                    plugins.forEach(function (plugin) {
                        const iconUrl = plugin.icons['1x'] || plugin.icons.default || 'https://s.w.org/style/images/codeispoetry.png';
                        const wpLink = `https://wordpress.org/plugins/${plugin.slug}/`;

                        const card = `
                            <div class="product-card animate-fade-in">
                                <div class="product-icon" style="background-color: rgba(255, 0, 0, 0.05); padding: 10px;">
                                    <img src="${iconUrl}" alt="${plugin.name}" width="65" height="65" style="border-radius: 2px;" />
                                </div>
                                <div class="product-info">
                                    <h3>${plugin.name}</h3>
                                    <p>${plugin.short_description}</p>
                                    <a href="${wpLink}" class="btn btn-outline" target="_blank" rel="noopener">Learn More</a>
                                </div>
                            </div>
                        `;
                        $container.append(card);
                    });
                }
            },
            error: function () {
                $('#wp-plugins-container').append('<p>Error fetching plugins.</p>');
            }
        });
    });

    // fetching android apps from playstore api having user name techbysh and inject it to the container
    // $.ajax({
    //     url: "https://playstoreapi.com/api/store/apps",
    //     dataType: "json",
    //     data: {
    //         developer: "techbysh",
    //         limit: 10
    //     },
    //     success: function (response) {
    //         const apps = response.apps || [];
    //         const $container = $('#mobile-apps-container');
    //         $container.empty();

    //         if (apps.length === 0) {
    //             $container.append('<p>No apps found for this developer.</p>');
    //         } else {
    //             apps.forEach(function (app) {
    //                 const iconUrl = app.icon || 'https://via.placeholder.com/65';
    //                 const playStoreLink = `https://play.google.com/store/apps/details?id=${app.package_name}`;
    //                 const card = `
    //                     <div class="product-card animate-fade-in">
    //                         <div class="product-icon" style="background-color: rgba(255, 0, 0, 0.05); padding: 10px;">
    //                             <img src="${iconUrl}" alt="${app.name}" width="65" height="65" style="border-radius: 2px;" />
    //                         </div>
    //                         <div class="product-info">
    //                             <h3>${app.name}</h3>
    //                             <p>${app.short_description}</p>
    //                             <a href="${playStoreLink}" class="btn btn-outline" target="_blank" rel="noopener">Learn More</a>
    //                         </div>
    //                     </div>
    //                 `;
    //                 $container.append(card);
    //             });
    //         }
    //     },
    //     error: function () {
    //         $('#android-apps-container').append('<p>Error fetching apps.</p>');
    //     }
    // });



    // Mobile menu toggle
    $('.mobile-menu-toggle').click(function() {
        $('.main-nav').toggleClass('active');
        $(this).toggleClass('active');
    });
    
    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        
        var target = this.hash;
        if (target === '#') return;
        
        var $target = $(target);
        if ($target.length) {
            $('html, body').animate({
                'scrollTop': $target.offset().top - 80
            }, 800, 'swing');
        }
    });
    
    // Scroll animations
    function checkAnimation() {
        var windowHeight = $(window).height();
        var windowTop = $(window).scrollTop();
        var windowBottom = windowTop + windowHeight;
        
        $('[data-animate]').each(function() {
            var $element = $(this);
            var elementHeight = $element.outerHeight();
            var elementTop = $element.offset().top;
            var elementBottom = elementTop + elementHeight;
            
            // Check if element is in viewport
            if (elementBottom >= windowTop && elementTop <= windowBottom) {
                $element.addClass('animate');
            }
        });
    }
    
    // Initial check
    checkAnimation();
    
    // Check on scroll
    $(window).on('scroll', function() {
        checkAnimation();
    });
    
    // Form submission
    $('.contact-form').on('submit', function(e) {
        e.preventDefault();
        
        // Here you would typically send the form data to your server
        // For this static example, we'll just show an alert
        alert('Thank you for your message! We will get back to you soon.');
        $(this).trigger('reset');
    });
    
    // Add pulse animation to buttons on hover
    $('.btn-primary').hover(
        function() {
            $(this).addClass('pulse-hover');
        },
        function() {
            $(this).removeClass('pulse-hover');
        }
    );
});