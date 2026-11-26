/* Service Worker — Catatan Keuangan (PWA offline) */
(function () {
  'use strict';
  /* Naikkan versi ini SETIAP KALI file aplikasi berubah, jika tidak
     pengguna PWA akan terus menerima aset lama (cache-first). */
  var CACHE = 'keuangan-v2';
  var ASSETS = [
    './',
    './index.html',
    './manifest.webmanifest',
    './icon-512.png',
    './icon-192.png',
    './apple-touch-icon.png',
    './css/base.css',
    './css/decor.css',
    './css/layout.css',
    './css/sheets.css',
    './css/summary.css',
    './css/form.css',
    './css/budget.css',
    './css/history.css',
    './css/phone.css',
    './css/slides.css',
    './css/motion.css',
    './js/categories.js',
    './js/utils.js',
    './js/state.js',
    './js/storage.js',
    './js/phone.js',
    './js/summary.js',
    './js/budget.js',
    './js/history.js',
    './js/form.js',
    './js/slides.js',
    './js/app.js'
  ];

  // Simpan semua aset saat pertama kali terpasang.
  self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
        .then(function () { return self.skipWaiting(); })
    );
  });

  // Ambil alih kontrol langsung.
  self.addEventListener('activate', function (e) {
    e.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) {
          if (k !== CACHE) return caches.delete(k);
        }));
      }).then(function () { return self.clients.claim(); })
    );
  });

  // Cache-first: aplikasi jalan tanpa internet.
  self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
        return hit || fetch(e.request).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          return res;
        });
      })
    );
  });
})();
