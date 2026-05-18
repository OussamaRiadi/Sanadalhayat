(function () {
    "use strict";
    var social = (window.SITE_CONFIG && window.SITE_CONFIG.social) || {};
    var map = {
        facebook: social.facebook,
        whatsapp: social.whatsapp,
        instagram: social.instagram,
    };
    document.querySelectorAll("[data-social]").forEach(function (el) {
        var key = el.getAttribute("data-social");
        if (map[key]) el.setAttribute("href", map[key]);
    });
})();
