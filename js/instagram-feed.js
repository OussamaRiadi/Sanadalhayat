(function () {
    "use strict";

    var cfg = (window.SITE_CONFIG && window.SITE_CONFIG.instagram) || {};
    var container = document.getElementById("instagram-feed");
    var profileLink = document.getElementById("instagram-profile-link");
    var lightboxEl = null;
    var galleryPosts = [];

    if (!container) return;

    function setProfileLink() {
        if (!profileLink) return;
        var url = cfg.profileUrl || "https://www.instagram.com/" + (cfg.username || "") + "/";
        profileLink.href = url;
        profileLink.innerHTML =
            '<i class="fab fa-instagram me-1"></i> @' + (cfg.username || "instagram");
    }

    function showLoading() {
        container.innerHTML =
            '<div class="instagram-gallery-loading">' +
            '<div class="spinner-border text-primary" role="status"></div>' +
            '<p class="mt-3 text-muted">جاري تحميل الصور بجودة عالية…</p>' +
            "</div>";
    }

    function showMessage(html) {
        container.innerHTML = '<div class="instagram-gallery-message">' + html + "</div>";
    }

    function getImageUrl(post) {
        if (post.media_type === "VIDEO") {
            return post.thumbnail_url || post.media_url || "";
        }
        return post.media_url || post.thumbnail_url || post.image || "";
    }

    function truncate(text, max) {
        if (!text) return "";
        text = text.replace(/\s+/g, " ").trim();
        return text.length > max ? text.slice(0, max) + "…" : text;
    }

    function ensureLightbox() {
        if (lightboxEl) return lightboxEl;
        lightboxEl = document.createElement("div");
        lightboxEl.className = "ig-lightbox";
        lightboxEl.setAttribute("role", "dialog");
        lightboxEl.setAttribute("aria-hidden", "true");
        lightboxEl.innerHTML =
            '<button type="button" class="ig-lightbox-close" aria-label="إغلاق">&times;</button>' +
            '<button type="button" class="ig-lightbox-prev" aria-label="السابق"><i class="bi bi-chevron-right"></i></button>' +
            '<button type="button" class="ig-lightbox-next" aria-label="التالي"><i class="bi bi-chevron-left"></i></button>' +
            '<div class="ig-lightbox-inner">' +
            '<img class="ig-lightbox-img" src="" alt="">' +
            '<div class="ig-lightbox-caption"></div>' +
            '<a class="ig-lightbox-link btn btn-primary btn-sm mt-3" href="#" target="_blank" rel="noopener">فتح على إنستغرام</a>' +
            "</div>";
        document.body.appendChild(lightboxEl);

        lightboxEl.querySelector(".ig-lightbox-close").addEventListener("click", closeLightbox);
        lightboxEl.querySelector(".ig-lightbox-prev").addEventListener("click", function () {
            navigateLightbox(-1);
        });
        lightboxEl.querySelector(".ig-lightbox-next").addEventListener("click", function () {
            navigateLightbox(1);
        });
        lightboxEl.addEventListener("click", function (e) {
            if (e.target === lightboxEl) closeLightbox();
        });
        document.addEventListener("keydown", function (e) {
            if (!lightboxEl.classList.contains("is-open")) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") navigateLightbox(1);
            if (e.key === "ArrowRight") navigateLightbox(-1);
        });
        return lightboxEl;
    }

    var lightboxIndex = 0;

    function openLightbox(index) {
        if (!galleryPosts.length) return;
        lightboxIndex = index;
        var lb = ensureLightbox();
        updateLightboxSlide();
        lb.classList.add("is-open");
        lb.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        if (!lightboxEl) return;
        lightboxEl.classList.remove("is-open");
        lightboxEl.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function navigateLightbox(dir) {
        lightboxIndex = (lightboxIndex + dir + galleryPosts.length) % galleryPosts.length;
        updateLightboxSlide();
    }

    function updateLightboxSlide() {
        var post = galleryPosts[lightboxIndex];
        var img = getImageUrl(post);
        var lb = ensureLightbox();
        var imgEl = lb.querySelector(".ig-lightbox-img");
        var cap = lb.querySelector(".ig-lightbox-caption");
        var link = lb.querySelector(".ig-lightbox-link");
        imgEl.src = img;
        imgEl.alt = truncate(post.caption, 80) || "منشور إنستغرام";
        cap.textContent = truncate(post.caption, 220) || "";
        link.href = post.permalink || cfg.profileUrl || "#";
        lb.querySelector(".ig-lightbox-prev").style.display =
            galleryPosts.length > 1 ? "" : "none";
        lb.querySelector(".ig-lightbox-next").style.display =
            galleryPosts.length > 1 ? "" : "none";
    }

    function renderGallery(posts) {
        galleryPosts = posts.filter(function (p) {
            return getImageUrl(p);
        });

        if (!galleryPosts.length) {
            showMessage(
                '<p>لا توجد صور للعرض. أضف <code>lightWidgetId</code> أو <code>postUrls</code> في config.js</p>'
            );
            return;
        }

        var cols = cfg.galleryColumns || 3;
        container.className = "instagram-gallery cols-" + cols;
        container.innerHTML = galleryPosts
            .map(function (post, i) {
                var img = getImageUrl(post);
                var cap = truncate(post.caption, 100);
                var isVideo = post.media_type === "VIDEO";
                return (
                    '<article class="ig-gallery-item" data-index="' +
                    i +
                    '">' +
                    '<button type="button" class="ig-gallery-btn" aria-label="عرض الصورة">' +
                    '<img src="' +
                    img +
                    '" alt="' +
                    (cap || "صورة إنستغرام") +
                    '" loading="lazy" decoding="async">' +
                    (isVideo
                        ? '<span class="ig-gallery-play"><i class="fas fa-play"></i></span>'
                        : "") +
                    '<span class="ig-gallery-zoom"><i class="fas fa-search-plus"></i></span>' +
                    "</button>" +
                    (cap ? '<p class="ig-gallery-caption">' + cap + "</p>" : "") +
                    "</article>"
                );
            })
            .join("");

        container.querySelectorAll(".ig-gallery-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var item = btn.closest(".ig-gallery-item");
                openLightbox(parseInt(item.getAttribute("data-index"), 10));
            });
        });
    }

    function fetchGraphApi() {
        var token = cfg.accessToken;
        var limit = cfg.postCount || 9;
        var fields =
            "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_type,media_url,thumbnail_url,permalink}";
        var url =
            "https://graph.instagram.com/me/media?fields=" +
            encodeURIComponent(fields) +
            "&limit=" +
            limit +
            "&access_token=" +
            encodeURIComponent(token);

        return fetch(url).then(function (res) {
            return res.json().then(function (data) {
                if (!res.ok) throw new Error((data.error && data.error.message) || "API error");
                var flat = [];
                (data.data || []).forEach(function (item) {
                    if (item.media_type === "CAROUSEL_ALBUM" && item.children && item.children.data) {
                        item.children.data.forEach(function (child, idx) {
                            flat.push({
                                caption: item.caption,
                                media_type: child.media_type,
                                media_url: child.media_url,
                                thumbnail_url: child.thumbnail_url,
                                permalink: child.permalink || item.permalink,
                                timestamp: item.timestamp,
                            });
                        });
                    } else {
                        flat.push(item);
                    }
                });
                return flat;
            });
        });
    }

    function fetchOembed(postUrl) {
        return fetch(
            "https://api.instagram.com/oembed?url=" +
                encodeURIComponent(postUrl) +
                "&omitscript=true&maxwidth=1080"
        ).then(function (res) {
            if (!res.ok) throw new Error("oembed failed");
            return res.json();
        });
    }

    function resolvePost(entry) {
        var url = (entry.url || entry.link || "").trim();
        var localImage = entry.image || entry.media_url || "";
        var localCaption = entry.caption || "";

        if (!url) {
            return Promise.resolve({
                caption: localCaption,
                media_url: localImage,
                thumbnail_url: localImage,
                permalink: cfg.profileUrl,
                media_type: "IMAGE",
            });
        }

        return fetchOembed(url)
            .then(function (o) {
                return {
                    caption: localCaption || o.title || "",
                    media_url: o.thumbnail_url,
                    thumbnail_url: o.thumbnail_url,
                    permalink: url,
                    media_type: "IMAGE",
                };
            })
            .catch(function () {
                return {
                    caption: localCaption,
                    media_url: localImage || "img/carousel-1.jpg",
                    thumbnail_url: localImage,
                    permalink: url,
                    media_type: "IMAGE",
                };
            });
    }

    function normalizeEntries(entries) {
        var list = [];
        (entries || []).forEach(function (item) {
            if (typeof item === "string") {
                list.push({ url: item });
            } else if (item && (item.url || item.image || item.caption)) {
                list.push(item);
            }
        });
        return list.slice(0, cfg.postCount || 12);
    }

    function loadPostsFromFile() {
        var file = cfg.postsFile || "instagram-posts.json";
        return fetch(file)
            .then(function (res) {
                if (!res.ok) throw new Error("posts file missing");
                return res.json();
            })
            .then(function (data) {
                var entries = normalizeEntries(data.posts || []);
                var extra = normalizeEntries(
                    (cfg.postUrls || []).map(function (u) {
                        return { url: u };
                    })
                );
                var merged = entries.concat(extra);
                var seen = {};
                merged = merged.filter(function (e) {
                    var key = (e.url || "") + (e.image || "") + (e.caption || "");
                    if (seen[key]) return false;
                    seen[key] = true;
                    return e.url || e.image || e.caption;
                });
                if (!merged.length) return Promise.reject(new Error("empty posts"));
                return Promise.all(merged.map(resolvePost));
            });
    }

    function fetchManualPosts() {
        return loadPostsFromFile();
    }

    function initLightWidget() {
        var id = cfg.lightWidgetId;
        var height = cfg.lightWidgetHeight || 900;
        container.className = "instagram-gallery instagram-widget-wrap";
        container.innerHTML =
            '<iframe src="https://cdn.lightwidget.com/widgets/' +
            id +
            '.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" title="Instagram @' +
            (cfg.username || "") +
            '" style="width:100%;border:0;overflow:hidden;height:' +
            height +
            'px"></iframe>';
        if (!document.getElementById("lightwidget-script")) {
            var s = document.createElement("script");
            s.id = "lightwidget-script";
            s.src = "https://cdn.lightwidget.com/widgets/lightwidget.js";
            s.async = true;
            document.body.appendChild(s);
        }
    }

    function initBehold() {
        var id = cfg.beholdWidgetId;
        container.className = "instagram-gallery behold-wrap";
        container.innerHTML =
            '<div class="behold-feed" data-behold-id="' + id + '"></div>';
        if (!document.getElementById("behold-widget-script")) {
            var s = document.createElement("script");
            s.id = "behold-widget-script";
            s.src = "https://w.behold.so/widget.js";
            s.async = true;
            document.body.appendChild(s);
        }
    }

    function showSetupHelp() {
        var user = cfg.username || "sanadalhayat";
        showMessage(
            "<h4 class=\"mb-3\">إضافة منشورات إنستغرام</h4>" +
            "<p class=\"text-muted\">افتح ملف <code>instagram-posts.json</code> والصق رابط كل منشور في <code>\"url\"</code></p>" +
            "<p class=\"small text-muted\">من التطبيق: ⋮ على المنشور → <strong>نسخ الرابط</strong></p>" +
            '<a href="https://www.instagram.com/' +
            user +
            '/" class="btn btn-primary mt-2" target="_blank" rel="noopener"><i class="fab fa-instagram me-1"></i> فتح @' +
            user +
            "</a>"
        );
    }

    function loadPostLinksGallery() {
        fetchManualPosts()
            .then(renderGallery)
            .catch(function (err) {
                console.warn("Posts load:", err);
                showSetupHelp();
            });
    }

    function init() {
        setProfileLink();
        showLoading();

        var mode = cfg.feedMode || "posts";

        if (mode === "posts" || (!cfg.lightWidgetId && !cfg.beholdWidgetId && !cfg.accessToken)) {
            loadPostLinksGallery();
            return;
        }

        if (cfg.lightWidgetId) {
            initLightWidget();
            return;
        }

        if (cfg.beholdWidgetId) {
            initBehold();
            return;
        }

        if (cfg.accessToken) {
            fetchGraphApi()
                .then(renderGallery)
                .catch(function (err) {
                    console.warn("Instagram API:", err);
                    loadPostLinksGallery();
                });
            return;
        }

        loadPostLinksGallery();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
