(function ($) {
    "use strict";

    // Sticky navbar
    $(window).on("scroll", function () {
        if ($(this).scrollTop() > 40) {
            $(".navbar").addClass("sticky-top");
        } else {
            $(".navbar").removeClass("sticky-top");
        }
    });

    // Back to top
    $(window).on("scroll", function () {
        if ($(this).scrollTop() > 100) {
            $(".back-to-top").fadeIn("slow");
        } else {
            $(".back-to-top").fadeOut("slow");
        }
    });

    $(".back-to-top").on("click", function (e) {
        e.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, 800, "swing");
    });

    // Smooth scroll for in-page anchors
    $('a[href^="#"]').on("click", function (e) {
        var target = $(this.getAttribute("href"));
        if (target.length) {
            e.preventDefault();
            $("html, body").animate(
                { scrollTop: target.offset().top - 80 },
                700,
                "swing"
            );
        }
    });

    // Mark active nav from current page
    var path = window.location.pathname.split("/").pop() || "index.html";
    $(".navbar-nav .nav-link").each(function () {
        var href = $(this).attr("href");
        if (href === path || (path === "" && href === "index.html")) {
            $(this).addClass("active");
        }
    });

    // Google Form: native POST handled by js/google-form.js when configured

    // Testimonials carousel (if present)
    if ($(".testimonial-carousel").length) {
        $(".testimonial-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            items: 1,
            dots: false,
            loop: true,
            nav: true,
            navText: [
                '<i class="bi bi-arrow-right"></i>',
                '<i class="bi bi-arrow-left"></i>',
            ],
        });
    }
})(jQuery);
