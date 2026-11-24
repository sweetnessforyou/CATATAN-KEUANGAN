/* =====================================================================
   summary.js — kartu ringkasan: donut chart + daftar kategori
   Klik/hover segmen atau baris kategori -> highlight + filter riwayat.
   ===================================================================== */
window.Keu = window.Keu || {};
(function (K) {
  'use strict';
  var S = K.s;

  var NS = 'http://www.w3.org/2000/svg';
  var C = 2 * Math.PI * 78;   // keliling ring (r = 78)
  var SEG = [];               // 7 slot segmen, dipakai ulang tiap render

  /* palet kontras khusus tab pemasukan: biru tua / kuning emas / ungu,
     jauh dari satu sama lain agar segmen mudah dibedakan */
  var COL_IN = { Gaji: '#2456a8', Bonus: '#e8a00c', Lainnya: '#7c4dbb' };

  /* warna segmen ring + legenda (pemasukan pakai palet kontras) */
  function ringCol(c) {
    return S.stab === 'in' && COL_IN[c] ? COL_IN[c] : (K.COL[c] || K.COL.Lainnya);
  }

  var g = document.createElementNS(NS, 'g');
  function mk(cls) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 100);
    c.setAttribute('cy', 100);
    c.setAttribute('r', 78);
    c.setAttribute('class', cls);
    g.appendChild(c);
    return c;
  }

  mk('trk');
  for (var i = 0; i < 7; i++) (function () {
    var c = mk('sg');
    c.style.strokeDasharray = '0 ' + C;
    c.onmouseenter = function () { if (c.dataset.c) { S.hov = c.dataset.c; highlight(); } };
    c.onmouseleave = function () { S.hov = null; highlight(); };
    c.onclick = function () {
      if (c.dataset.c) {
        S.sel = S.sel === c.dataset.c ? null : c.dataset.c;
        S.hov = null;
        K.render();
      }
    };
    SEG.push(c);
  })();
  K.$('rs').appendChild(g);

  /* --- ring kecil "Uang bulanan": persentase terpakai --- */
  var MG = document.createElementNS(NS, 'g');
  function mkm(cls) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 100);
    c.setAttribute('cy', 100);
    c.setAttribute('r', 78);
    c.setAttribute('class', cls);
    MG.appendChild(c);
    return c;
  }
  mkm('trk');
  var M_USE = mkm('sg');
  M_USE.style.stroke = 'var(--soft)';
  K.$('rm').appendChild(MG);

  /* kecilkan font angka sampai muat di lebar ring (dipakai #cV & #mV) */
  function fit(v) {
    v.style.fontSize = '';
    var fs = parseFloat(getComputedStyle(v).fontSize), guard = 0;
    while (v.scrollWidth > v.clientWidth && fs > 9 && guard++ < 24) {
      fs -= 1;
      v.style.fontSize = fs + 'px';
    }
  }

  /* sorotan kategori: hover di ring/daftar, atau kategori terpilih */
  function highlight() {
    var f = S.hov || S.sel;

    /* warna selotip kartu ikut warna kategori */
    var sp = document.querySelector('.sum');
    if (f && ringCol(f)) sp.style.setProperty('--fc', ringCol(f));
    else sp.style.removeProperty('--fc');

    SEG.forEach(function (c) {
      c.classList.toggle('on', !!f && c.dataset.c === f);
      c.classList.toggle('dim', !!f && c.dataset.c !== f);
    });
    var d = f && S.items.filter(function (x) { return x.c === f; })[0], val;
    if (d) {
      K.$('cI').innerHTML = K.svg(d.c, 24);
      K.$('cI').style.color = K.COL[d.c];
      K.$('cL').textContent = d.c;
      val = K.rp(d.v);
      K.$('cS').textContent = Math.round(d.v / S.total * 100) + '% dari total';
    } else {
      K.$('cI').innerHTML = '';
      K.$('cL').textContent = S.stab === 'out' ? 'Total pengeluaran' : 'Total pemasukan';
      val = K.rp(S.total);
      K.$('cS').textContent = S.cnt ? S.cnt + ' transaksi' : 'Belum ada data';
    }
    var v = K.$('cV');
    v.textContent = val;
    fit(v);
  }

  /* legenda di samping donut: kotak warna + nama + persentase.
     Klik/hover legenda = sama seperti klik/hover segmen ring */
  function renderLegend() {
    var el = K.$('lg');
    el.innerHTML = '';
    if (!S.items.length) {
      var e = document.createElement('span');
      e.className = 'lgi';
      e.style.cursor = 'default';
      e.innerHTML = '<span>Belum ada data</span>';
      el.appendChild(e);
      return;
    }
    var f = S.hov || S.sel;
    S.items.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lgi' + (f && f !== d.c ? ' dim' : '');
      b.innerHTML = '<i style="background:' + ringCol(d.c) + '"></i>' +
        '<span>' + d.c + '</span><b>' + Math.round(d.v / S.total * 100) + '%</b>';
      b.onmouseenter = function () { S.hov = d.c; highlight(); };
      b.onmouseleave = function () { S.hov = null; highlight(); };
      b.onclick = function () {
        S.sel = S.sel === d.c ? null : d.c;
        S.hov = null;
        K.render();
      };
      el.appendChild(b);
    });
  }

  /* hitung total + komposisi kategori untuk tab & periode aktif */
  K.renderSummary = function () {
    var G = {};
    S.total = 0;
    S.cnt = 0;

    S.txs.forEach(function (t) {
      if (t.type !== S.stab || !K.inRange(t.date)) return;
      S.total += t.amount;
      S.cnt++;
      var x = G[t.cat] || (G[t.cat] = { c: t.cat, v: 0, n: 0 });
      x.v += t.amount;
      x.n++;
    });

    S.items = Object.keys(G)
      .map(function (k) { return G[k]; })
      .sort(function (a, b) { return b.v - a.v; });
    if (S.sel && !G[S.sel]) S.sel = null;

    /* gambar 7 segmen ring; render pertama ditunda satu frame supaya
       transisi .sg menggambar ring dari nol (efek sweep saat buka app) */
    var first = !drawn;
    drawn = true;
    function draw() {
      var gap = S.items.length > 1 ? 3 : 0, acc = 0;
      SEG.forEach(function (c, i) {
        var d = S.items[i];
        if (d) {
          var share = d.v / S.total * C, len = Math.max(share - gap, .5);
          c.style.stroke = ringCol(d.c);
          c.style.strokeDasharray = len + ' ' + (C - len);
          c.style.strokeDashoffset = -(acc + gap / 2);
          c.dataset.c = d.c;
          acc += share;
        } else {
          c.style.strokeDasharray = '0 ' + C;
          delete c.dataset.c;
        }
      });
      renderMonthly(first);
    }
    if (first) requestAnimationFrame(draw);
    else draw();

    highlight();
    renderLegend();
  };
  var drawn = false;

  /* ring "Uang bulanan": menampilkan total uang bulanan bulan berjalan.
     Ring diisi sesuai sisa uang bulanan yang belum terpakai. */
  function renderMonthly(first) {
    var m = K.monthly();
    var v = K.$('mV'), s = K.$('mS');

    if (m.inp <= 0) {
      M_USE.style.strokeDasharray = '0 ' + C;
      v.textContent = 'Rp0';
      v.style.color = '';
      fit(v);
      s.textContent = 'belum ada uang bulanan';
      s.classList.remove('warn', 'habis');
      return;
    }

    var sisa = m.inp - m.out;
    var frac = Math.min(Math.max(sisa / m.inp, 0), 1);

    /* warna ring mengikuti sisa — sage saat aman, madu saat menipis,
       merah bata saat habis */
    var col = sisa <= 0 ? 'var(--out)' : frac < .4 ? '#e6a416' : 'var(--soft)';

    var len = frac * C;
    /* render pertama: mulai dari ring kosong agar ikut efek sweep */
    if (first) M_USE.style.strokeDasharray = '0 ' + C;
    var set = function () {
      M_USE.style.strokeDasharray =
        Math.max(len - (frac > 0 && frac < 1 ? 3 : 0), frac > 0 ? .5 : 0) + ' ' + C;
    };
    if (first) requestAnimationFrame(set);
    else set();
    M_USE.style.stroke = col;

    v.textContent = K.rp(m.inp);
    fit(v);
    s.textContent = sisa === m.inp ? 'belum terpakai' : 'sisa ' + K.rp(Math.max(sisa, 0));
    s.classList.toggle('warn', sisa > 0 && frac < .4);
    s.classList.toggle('habis', sisa <= 0);
  }

  /* tab pengeluaran/pemasukan & pilihan periode */
  K.wire('tabs', function (v) { S.stab = v; S.sel = null; S.hov = null; K.render(); });
  K.wire('per', function (v) { S.per = v; S.sel = null; S.hov = null; K.render(); });
})(window.Keu);
