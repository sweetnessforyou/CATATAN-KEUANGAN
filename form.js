/* =====================================================================
   form.js — kartu "Catat transaksi": dua kolom, Pengeluaran & Pemasukan.
   Tanggal (input) mengikuti hari ini secara real-time selama belum diubah manual.
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';
  var S = K.s;

  /* "25000" -> "25.000" */
  function groupDigits(d) {
    return d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /* ambil digit saja, buang nol di depan, batasi 15 digit */
  function cleanAmount(v) {
    return v.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 15);
  }

  /* pasang format titik ribuan otomatis pada input jumlah */
  function wireAmount(id) {
    var inp = K.$(id);
    inp.addEventListener('input', function () {
      /* jumlah digit di kiri kursor, supaya posisi kursor tidak melompat */
      var before = inp.value.slice(0, inp.selectionStart).replace(/\D/g, '').length;
      var out = groupDigits(cleanAmount(inp.value));
      inp.value = out;

      var pos = 0, seen = 0;
      while (pos < out.length && seen < before) {
        if (out.charCodeAt(pos) >= 48 && out.charCodeAt(pos) <= 57) seen++;
        pos++;
      }
      inp.setSelectionRange(pos, pos);
    });
    return inp;
  }

  /* --- chip kategori untuk satu form --- */
  function buildCats(h, list, sel, onpick) {
    h.innerHTML = '';
    list.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat';
      b.dataset.c = c;
      b.setAttribute('aria-pressed', c === sel);
      b.innerHTML = K.svg(c, 15) + '<span></span>';
      b.lastChild.textContent = c;
      b.onclick = function () {
        onpick(c);
        [].forEach.call(h.children, function (x) {
          x.setAttribute('aria-pressed', x.dataset.c === c);
        });
      };
      h.appendChild(b);
    });
  }

  /* --- pengeluaran --- */
  var amt = wireAmount('amt');
  buildCats(K.$('cats'), K.OUT, S.fcat, function (c) { S.fcat = c; });

  /* --- pemasukan --- */
  var amti = wireAmount('amti');
  buildCats(K.$('catsi'), K.IN, S.fcati, function (c) { S.fcati = c; });

  /* --- tanggal real-time: input mengikuti hari ini
     selama pengguna belum mengubahnya manual --- */
  ['dt', 'dti'].forEach(function (id) {
    K.$(id).addEventListener('change', function () {
      /* tandai "manual" hanya kalau tanggalnya memang bukan hari ini */
      if (this.value === K.fmt(new Date())) delete this.dataset.manual;
      else this.dataset.manual = '1';
    });
  });
  function tick() {
    var now = new Date();
    ['dt', 'dti'].forEach(function (id) {
      var inp = K.$(id);
      /* jangan timpa nilai saat pengguna sedang memilih/mengetik tanggal
         (menimpa saat picker terbuka bisa menutupnya) */
      if (!inp.dataset.manual && document.activeElement !== inp) inp.value = K.fmt(now);
    });
  }
  tick();
  setInterval(tick, 1000);

  /* kalau tanggal di luar periode yang dilihat, pindah ke bulan transaksi */
  function alignPeriod(date) {
    if (!K.inRange(date)) {
      S.per = 'bulan';
      K.setSeg('per', 'bulan');
      S.month = date.slice(0, 7);
    }
  }

  /* reset input jumlah & catatan satu form */
  function clearForm(a, n) {
    a.value = '';
    n.value = '';
  }

  /* --- submit pengeluaran --- */
  K.$('f').onsubmit = function (e) {
    e.preventDefault();
    var a = parseFloat(cleanAmount(amt.value));
    if (!(a > 0)) return;

    var t = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      type: 'out',
      amount: a,
      cat: S.fcat,
      note: K.$('note').value.trim(),
      date: K.$('dt').value
    };
    /* pengeluaran baru selalu dibayar dari uang bulanan
       (data lama bersumber tabungan tetap dikenali) */
    t.src = 'income';

    alignPeriod(t.date);
    K.saveTx(t);
    pop();
    clearForm(amt, K.$('note'));
    amt.focus();
    flash(K.$('sv'), 'Tersimpan');
  };

  /* --- submit pemasukan --- */
  K.$('fi').onsubmit = function (e) {
    e.preventDefault();
    var a = parseFloat(cleanAmount(amti.value));
    if (!(a > 0)) return;

    var t = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      type: 'in',
      amount: a,
      cat: S.fcati,
      note: K.$('notei').value.trim(),
      date: K.$('dti').value,
      /* sumber mengikuti kategori: Bonus di luar uang bulanan,
         sisanya (Gaji/Lainnya) dihitung sebagai uang bulanan */
      src: S.fcati === 'Bonus' ? 'bonus' : 'monthly'
    };

    alignPeriod(t.date);
    K.saveTx(t);
    pop();
    clearForm(amti, K.$('notei'));
    amti.focus();
    flash(K.$('svi'), 'Tersimpan');
  };

  /* animasi kecil: kartu form bergoyang pelan saat tersimpan */
  function pop() {
    var card = K.$('f').closest('.frm');
    if (!card) return;
    card.classList.remove('pop');
    void card.getBoundingClientRect();
    card.classList.add('pop');
  }

  /* umpan balik tombol "Tersimpan" sesaat */
  function flash(btn, msg) {
    btn.textContent = msg;
    setTimeout(function () {
      btn.textContent = btn.id === 'sv' ? 'Simpan pengeluaran' : 'Simpan pemasukan';
    }, 1000);
  }
})(window.Keu);
