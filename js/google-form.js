(function () {
    "use strict";

    var cfg = window.SITE_CONFIG && window.SITE_CONFIG.googleForm;
    if (!cfg) return;

    function getFormResponseUrl(formUrl) {
        if (!formUrl) return "";
        return formUrl
            .replace(/\/viewform.*$/, "/formResponse")
            .replace(/\/edit.*$/, "/formResponse");
    }

    function isConfigured() {
        return Boolean(cfg.formUrl && cfg.formUrl.indexOf("docs.google.com") !== -1);
    }

    function hasFieldMapping() {
        var f = cfg.fields || {};
        return Boolean(f.name || f.email || f.message);
    }

    function setupEmbed() {
        var wrap = document.getElementById("google-form-embed");
        if (!wrap) return;

        var embedUrl = cfg.formUrl.replace("/viewform", "/viewform?embedded=true");
        if (embedUrl.indexOf("embedded=true") === -1) {
            embedUrl += (embedUrl.indexOf("?") === -1 ? "?" : "&") + "embedded=true";
        }

        wrap.innerHTML =
            '<iframe src="' +
            embedUrl +
            '" width="100%" height="900" frameborder="0" marginheight="0" marginwidth="0" title="نموذج الانخراط">جاري التحميل…</iframe>';

        var custom = document.getElementById("membership-form");
        var customWrap = document.getElementById("custom-form-wrap");
        if (customWrap) customWrap.classList.add("d-none");
        if (custom) custom.remove();
    }

    function setupCustomPost() {
        var form = document.getElementById("membership-form");
        if (!form || !isConfigured()) return;

        var action = getFormResponseUrl(cfg.formUrl);
        form.setAttribute("action", action);
        form.setAttribute("method", "POST");
        form.setAttribute("target", "_blank");

        var fields = cfg.fields;
        mapField("member-name", fields.name);
        mapField("member-email", fields.email);
        mapField("member-phone", fields.phone);
        mapField("member-subject", fields.subject);
        mapField("member-message", fields.message);

        var hint = document.getElementById("form-hint");
        if (hint) {
            hint.textContent =
                "يُرسل الطلب مباشرة إلى Google Forms ويُحفظ في جدول الاستجابات.";
        }

        form.addEventListener("submit", function (e) {
            var name = document.getElementById("member-name");
            var email = document.getElementById("member-email");
            var message = document.getElementById("member-message");
            var alertBox = document.getElementById("form-alert");
            if (!name || !email || !message) return;

            if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
                e.preventDefault();
                if (alertBox) {
                    alertBox.className = "alert alert-warning show form-alert";
                    alertBox.textContent =
                        "يرجى ملء الاسم والبريد الإلكتروني والرسالة.";
                }
            } else if (alertBox) {
                alertBox.className = "alert alert-success show form-alert";
                alertBox.textContent =
                    "جاري الإرسال… ستُفتح صفحة تأكيد Google Forms في نافذة جديدة.";
            }
        });
    }

    function mapField(inputId, entryName) {
        var input = document.getElementById(inputId);
        if (!input || !entryName) return;
        input.setAttribute("name", entryName);
    }

    function showNotConfigured() {
        var alertBox = document.getElementById("form-alert");
        if (!alertBox) return;
        alertBox.className = "alert alert-warning show form-alert";
        alertBox.innerHTML =
            'لم يتم ربط Google Form بعد. افتح <code>config.js</code> والصق رابط النموذج في <code>googleForm.formUrl</code>.';
    }

    function init() {
        if (!isConfigured()) {
            showNotConfigured();
            return;
        }

        if (hasFieldMapping()) {
            setupCustomPost();
        } else {
            setupEmbed();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
