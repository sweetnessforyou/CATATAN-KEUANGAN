/* =====================================================================
   phone.js — jam pada status bar bingkai HP
   Diperbarui tiap 1 detik dan mengikuti jam & zona waktu perangkat
   (Handphone), jadi menit yang tampil selalu sama dengan menit asli.
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';

  var el = document.getElementById('clk');
  if (!el) return;

  function tick() {
    var d = new Date();
    /* hourCycle 'h23' agar tengah malam tampil "00.00", bukan "24.00"
       (kelainan hour12:false pada sebagian browser) */
    el.textContent = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  }

  tick();
  setInterval(tick, 1000);
  /* perangkat bisa tidur / tab lama tak terlihat: segarkan segera
     saat halaman kembali dilihat agar jam tidak telat */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tick();
  });
})(window.Keu);
