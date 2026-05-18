/**
 * إعدادات الموقع
 *
 * INSTAGRAM — الطريقة المفعّلة: روابط المنشورات
 * عدّل ملف instagram-posts.json وأضف رابط كل منشور في حقل "url"
 * (من إنستغرام: ⋮ على المنشور → نسخ الرابط)
 */
window.SITE_CONFIG = {
    googleForm: {
        formUrl: "",
        fields: {
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        },
    },

    instagram: {
        username: "sanadalhayat",
        displayName: "سند الحياة",
        profileUrl: "https://www.instagram.com/sanadalhayat/",

        // الطريقة المفعّلة: روابط المنشورات (ملف instagram-posts.json)
        feedMode: "posts",
        postsFile: "instagram-posts.json",

        postCount: 12,
        galleryColumns: 3,

        // روابط إضافية (اختياري — تُدمج مع الملف)
        postUrls: [],

        // طرق أخرى (اتركها فارغة)
        lightWidgetId: "",
        beholdWidgetId: "",
        accessToken: "",
    },

    social: {
        facebook: "https://www.facebook.com/",
        whatsapp: "https://wa.me/212600000000",
        instagram: "https://www.instagram.com/sanadalhayat/",
    },
};
