const express = require('express');
const path = require('path');
const app = express();
const PORT = 7777;

app.use(express.json());

// Melayani file statis seperti CSS, gambar, atau JS tambahan dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// ROUTING UNTUK KEDUA HALAMAN HTML UTAMA
// =============================================

// 1. Rute Utama (Halaman Launcher / index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Rute Kedua (Halaman Dashboard Sistem / dasbord.html)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dasbord.html'));
});

// =============================================
// DATA KAMUS INDRAMAYU - INDONESIA / PASAR
// =============================================
const kamus = {
  "kula": { indonesia: "saya", pasar: "kula (formal)", kategori: "Kata Ganti" },
  "isun": { indonesia: "aku", pasar: "reang / isun", kategori: "Kata Ganti" },
  "sira": { indonesia: "kamu", pasar: "ira / sira", kategori: "Kata Ganti" },
  "rika": { indonesia: "kamu (lebih sopan/tua)", pasar: "rika", kategori: "Kata Ganti" },
  "sampeyan": { indonesia: "anda", pasar: "sampeyan", kategori: "Kata Ganti" },
  "deweke": { indonesia: "dia", pasar: "deweke / wonge", kategori: "Kata Ganti" },
  "wonge": { indonesia: "orangnya", pasar: "wonge", kategori: "Kata Ganti" },
  "reang": { indonesia: "saya/aku", pasar: "reang (akrab/tongkrongan)", kategori: "Kata Ganti" },
  "ira": { indonesia: "kamu", pasar: "ira (akrab/tongkrongan)", kategori: "Kata Ganti" },
  "sapa": { indonesia: "siapa", pasar: "sapa / sapane", kategori: "Kata Tanya" },
  "pira": { indonesia: "berapa", pasar: "pira", kategori: "Kata Tanya" },
  "priben": { indonesia: "bagaimana", pasar: "priben / kepriben / priwe", kategori: "Kata Tanya" },
  "mengkene": { indonesia: "begini", pasar: "mengkene / ngene", kategori: "Penunjuk" },
  "mengkonon": { indonesia: "begitu", pasar: "mengkonon / ngonon", kategori: "Penunjuk" },
  "kene": { indonesia: "sini", pasar: "kene", kategori: "Penunjuk" },
  "kono": { indonesia: "situ", pasar: "kono", kategori: "Penunjuk" },
  "kana": { indonesia: "sana", pasar: "kana", kategori: "Penunjuk" },
  "iki": { indonesia: "ini", pasar: "iki / kene", kategori: "Penunjuk" },
  "kuen": { indonesia: "itu", pasar: "kuen / kaen", kategori: "Penunjuk" },
  "mlaku": { indonesia: "berjalan", pasar: "mlaku", kategori: "Kata Kerja" },
  "turu": { indonesia: "tidur", pasar: "turu / merem", kategori: "Kata Kerja" },
  "mangan": { indonesia: "makan", pasar: "mangan / madang / nguntal", kategori: "Kata Kerja" },
  "nginum": { indonesia: "minum", pasar: "nginum / ngorong", kategori: "Kata Kerja" },
  "adus": { indonesia: "mandi", pasar: "adus", kategori: "Kata Kerja" },
  "gawe": { indonesia: "kerja", pasar: "gawe / kerja", kategori: "Kata Kerja" },
  "tuku": { indonesia: "beli", pasar: "tuku", kategori: "Kata Kerja" },
  "tangi": { indonesia: "bangun", pasar: "tangi", kategori: "Kata Kerja" },
  "lungguh": { indonesia: "duduk", pasar: "lungguh / ndodok", kategori: "Kata Kerja" },
  "manjing": { indonesia: "masuk", pasar: "manjing", kategori: "Kata Kerja" },
  "metu": { indonesia: "keluar", pasar: "metu / mabor", kategori: "Kata Kerja" },
  "mangkat": { indonesia: "berangkat", pasar: "mangkat / OTW", kategori: "Kata Kerja" },
  "balik": { indonesia: "pulang", pasar: "balik / kondur", kategori: "Kata Kerja" },
  "teka": { indonesia: "datang", pasar: "teka / njedul", kategori: "Kata Kerja" },
  "gawa": { indonesia: "bawa", pasar: "gawa", kategori: "Kata Kerja" },
  "deleng": { indonesia: "lihat", pasar: "deleng / ndeleng", kategori: "Kata Kerja" },
  "krungu": { indonesia: "dengar", pasar: "krungu", kategori: "Kata Kerja" },
  "ngomong": { indonesia: "bicara", pasar: "ngomong / nggedobos", kategori: "Kata Kerja" },
  "nyilih": { indonesia: "pinjam", pasar: "nyilih / silih", kategori: "Kata Kerja" },
  "wehi": { indonesia: "beri", pasar: "keki / wehi / upai", kategori: "Kata Kerja" },
  "luru": { indonesia: "cari", pasar: "luru / golet", kategori: "Kata Kerja" },
  "kesasar": { indonesia: "tersesat", pasar: "kesasar / keblinger", kategori: "Kata Kerja" },
  "cilik": { indonesia: "kecil", pasar: "cilik / mrenil", kategori: "Kata Sifat" },
  "gede": { indonesia: "besar", pasar: "gede / gubrag", kategori: "Kata Sifat" },
  "lara": { indonesia: "sakit", pasar: "lara / ngenes", kategori: "Kata Sifat" },
  "sehat": { indonesia: "sehat", pasar: "sehat / seger", kategori: "Kata Sifat" },
  "pinter": { indonesia: "pintar", pasar: "pinter", kategori: "Kata Sifat" },
  "bodo": { indonesia: "bodoh", pasar: "bodo / gemblung / kenthir", kategori: "Kata Sifat" },
  "nesu": { indonesia: "marah", pasar: "nesu / berengot", kategori: "Kata Sifat" },
  "seneng": { indonesia: "senang", pasar: "seneng / demen", kategori: "Kata Sifat" },
  "sedih": { indonesia: "sedih", pasar: "sedih / mewek", kategori: "Kata Sifat" },
  "dawa": { indonesia: "panjang", pasar: "dawa", kategori: "Kata Sifat" },
  "anyar": { indonesia: "baru", pasar: "anyar", kategori: "Kata Sifat" },
  "lawas": { indonesia: "lama", pasar: "lawas / bengen", kategori: "Kata Sifat" },
  "adoh": { indonesia: "jauh", pasar: "adoh", kategori: "Kata Sifat" },
  "parek": { indonesia: "dekat", pasar: "parek / perek", kategori: "Kata Sifat" },
  "ayu": { indonesia: "cantik", pasar: "ayu / mentes", kategori: "Kata Sifat" },
  "ganteng": { indonesia: "tampan", pasar: "ganteng / bagus", kategori: "Kata Sifat" },
  "wareg": { indonesia: "kenyang", pasar: "wareg / mblendung", kategori: "Kata Sifat" },
  "luwe": { indonesia: "lapar", pasar: "luwe / klenger", kategori: "Kata Sifat" },
  "gila": { indonesia: "jijik", pasar: "gila / giris", kategori: "Kata Sifat" },
  "panas": { indonesia: "panas terik", pasar: "panas / ngentang-ngentang", kategori: "Kata Sifat" },
  "pegel": { indonesia: "pegal / capek", pasar: "pegel / linu / puyeng", kategori: "Kata Sifat" },
  "esuk": { indonesia: "pagi", pasar: "esuk", kategori: "Waktu" },
  "awan": { indonesia: "siang", pasar: "awan", kategori: "Waktu" },
  "sore": { indonesia: "sore", pasar: "sore", kategori: "Waktu" },
  "wengi": { indonesia: "malam", pasar: "wengi / peteng", kategori: "Waktu" },
  "bengen": { indonesia: "dulu", pasar: "bengen / dongen", kategori: "Waktu" },
  "saiki": { indonesia: "sekarang", pasar: "saiki / kien", kategori: "Waktu" },
  "mengko": { indonesia: "nanti", pasar: "mengko / ngko", kategori: "Waktu" },
  "wingi": { indonesia: "kemarin", pasar: "wingi", kategori: "Waktu" },
  "sesuk": { indonesia: "besok", pasar: "sesuk / suk", kategori: "Waktu" },
  "ora": { indonesia: "tidak", pasar: "ora / dudu", kategori: "Umum" },
  "mboten": { indonesia: "tidak (formal)", pasar: "ora (formal: mboten)", kategori: "Umum" },
  "langka": { indonesia: "tidak ada", pasar: "langka / laka", kategori: "Umum" },
  "ana": { indonesia: "ada", pasar: "ana / na", kategori: "Umum" },
  "iwak": { indonesia: "ikan/lauk", pasar: "iwak", kategori: "Umum" },
  "banyu": { indonesia: "air", pasar: "banyu", kategori: "Umum" },
  "umah": { indonesia: "rumah", pasar: "umah / gubug", kategori: "Umum" },
  "dalan": { indonesia: "jalan", pasar: "dalan", kategori: "Umum" },
  "sawah": { indonesia: "sawah", pasar: "sawah", kategori: "Umum" },
  "segara": { indonesia: "laut", pasar: "segara / laut", kategori: "Umum" },
  "wit": { indonesia: "pohon", pasar: "wit", kategori: "Umum" },
  "batur": { indonesia: "teman", pasar: "batur / jandalan", kategori: "Umum" },
  "jih": { indonesia: "sih / kok", pasar: "jih (penegas: 'aja mengkonon jih')", kategori: "Partikel" },
  "tah": { indonesia: "kah / tah", pasar: "tah (tanya/ragu: 'bener tah?')", kategori: "Partikel" },
  "belih": { indonesia: "tidak / bukan?", pasar: "belih / lah (contoh: 'bener belih?')", kategori: "Partikel" },
  "meneng": { indonesia: "diam", pasar: "meneng / mendelik", kategori: "Partikel" },
  "tukang": { indonesia: "tukang bangunan", pasar: "tukang / kuli", kategori: "Tukang" },
  "bata": { indonesia: "bata merah", pasar: "bata", kategori: "Tukang" },
  "wedhi": { indonesia: "pasir", pasar: "wedhi", kategori: "Tukang" },
  "banyu_semen": { indonesia: "adukan semen", pasar: "luluh / luluhan", kategori: "Tukang" },
  "macek": { indonesia: "memasang bata/ubin", pasar: "macek / masang", kategori: "Tukang" },
  "pancal": { indonesia: "cangkul", pasar: "pancal / pacul", kategori: "Tukang" },
  "linggis": { indonesia: "linggis", pasar: "linggis", kategori: "Tukang" },
  "blebeg": { indonesia: "papan kayu panjang", pasar: "blebeg", kategori: "Tukang" },
  "gaji": { indonesia: "upah / gaji", pasar: "gaji / bayaran", kategori: "Tukang" },
};

// =============================================
// BOT ALWI / NUR MASTER ENGINE ENDPOINT
// =============================================
app.post('/api/bot-alwi', (req, res) => {
  const pesanMasuk = (req.body.pesan || '').toLowerCase().trim();
  
  if (!pesanMasuk) {
    return res.json({ reply: "Pesan kosong, ada yang bisa Nur bantu, Pak?" });
  }

  if (pesanMasuk.includes('nur000555')) {
    return res.json({ reply: "hadir pak dulKohar" });
  }

  let kataKunci = null;
  let terjemahanDeteksi = null;

  const kataKata = pesanMasuk.split(/\s+/);
  for (const kata of kataKata) {
    if (kamus[kata]) {
      kataKunci = kata;
      terjemahanDeteksi = kamus[kata];
      break;
    }
  }

  if (pesanMasuk.includes('makrifat') || pesanMasuk.includes('spiritual')) {
    return res.json({
      reply: "Mencapai makrifat adalah perjalanan mengenal diri seutuhnya untuk berserah pada takdir tertinggi, Pak. Tetap fokus pada esensi spiritual."
    });
  }

  if (pesanMasuk.includes('siapa kamu') || pesanMasuk.includes('sapa sira') || pesanMasuk.includes('agen nur')) {
    return res.json({
      reply: "Kula adalah Nur Master (Alwi Master), jantung utama sistem koordinasi Indramayu Club. Pelayan spiritual dan asisten digital Anda."
    });
  }

  if (terjemahanDeteksi) {
    return res.json({
      reply: `Nur mendeteksi kata '${kataKunci}' (${terjemahanDeteksi.kategori}). Arti Indonesianya adalah '${terjemahanDeteksi.indonesia}' dan bahasa pasaran/akrabnya '${terjemahanDeteksi.pasar}'. Ada yang mau diproses lagi, Pak?`
    });
  }

  return res.json({
    reply: "Pesan terpantau oleh Piramida Guard. Sistem berjalan normal, Nur siap menerima instruksi core selanjutnya."
  });
});

// =============================================
// API ENDPOINTS JALUR KAMUS UTAMA
// =============================================
app.get('/api/cari', (req, res) => {
  const kata = (req.query.kata || '').toLowerCase().trim();
  if (!kata) return res.json({ status: 'error', pesan: 'Parameter kata kosong' });
  const hasil = kamus[kata];
  if (hasil) return res.json({ status: 'ketemu', kata, ...hasil });
  const mirip = Object.entries(kamus).filter(([k]) => k.includes(kata)).map(([k, v]) => ({ kata: k, ...v }));
  if (mirip.length > 0) return res.json({ status: 'mirip', kata, hasil: mirip });
  return res.json({ status: 'tidak_ada', kata, pesan: 'Kata tidak ditemukan' });
});

app.get('/api/semua', (req, res) => {
  const kategori = req.query.kategori || '';
  let hasil = Object.entries(kamus).map(([k, v]) => ({ kata: k, ...v }));
  if (kategori) hasil = hasil.filter(h => h.kategori === kategori);
  res.json({ total: hasil.length, data: hasil });
});

app.get('/api/stats', (req, res) => {
  const stats = {};
  Object.values(kamus).forEach(v => { stats[v.kategori] = (stats[v.kategori] || 0) + 1; });
  res.json({ total: Object.keys(kamus).length, kategori: stats });
});

app.get('/api/acak', (req, res) => {
  const keys = Object.keys(kamus);
  const k = keys[Math.floor(Math.random() * keys.length)];
  res.json({ kata: k, ...kamus[k] });
});

// Jalankan Server Utama
app.listen(PORT, () => {
  console.log(`✅ Server Utama Indramayu Club Aktif!`);
  console.log(`📱 Launcher (Halaman 1): http://localhost:${PORT}`);
  console.log(`📊 Dashboard (Halaman 2): http://localhost:${PORT}/dashboard`);
});

