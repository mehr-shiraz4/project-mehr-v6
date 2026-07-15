// PWA Manifest + Icons
// ===== INLINE MANIFEST =====
(function() {
  var svgIcon192 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="32" fill="#0D2444"/><rect x="20" y="20" width="152" height="152" rx="20" fill="#1565C0"/><text x="96" y="125" font-size="80" text-anchor="middle" font-family="serif">🏛</text></svg>';
  var svgIcon512 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="#0D2444"/><rect x="40" y="40" width="432" height="432" rx="60" fill="#1565C0"/><text x="256" y="330" font-size="220" text-anchor="middle" font-family="serif">🏛</text></svg>';
  
  var blob192 = new Blob([svgIcon192], {type: 'image/svg+xml'});
  var blob512 = new Blob([svgIcon512], {type: 'image/svg+xml'});
  var url192 = URL.createObjectURL(blob192);
  var url512 = URL.createObjectURL(blob512);
  
  document.getElementById('pwa-icon').href = url192;
  
  var manifest = {
    name: "سامانه جامع پروژه مهر",
    short_name: "پروژه مهر",
    description: "سامانه مدیریت پروژه مهر - ناحیه ۴ شیراز",
    start_url: "./",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0D2444",
    theme_color: "#1565C0",
    lang: "fa",
    dir: "rtl",
    icons: [
      { src: url192, sizes: "192x192", type: "image/svg+xml", purpose: "any maskable" },
      { src: url512, sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }
    ]
  };
  var mblob = new Blob([JSON.stringify(manifest)], {type: 'application/manifest+json'});
  var murl = URL.createObjectURL(mblob);
  var link = document.createElement('link');
  link.rel = 'manifest';
  link.href = murl;
  document.head.appendChild(link);
})();

// ===== SERVICE WORKER =====
// Note: Blob URL SW registration is blocked by browsers.
// SW only works when this file is served from a real server with a proper sw.js file.
// Skipping blob-based SW to avoid console errors.
