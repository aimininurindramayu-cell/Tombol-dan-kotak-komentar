/**
 * Proyek: Piramida Guard - Multi-Account Node Core & Kamus AI Nur
 * Deskripsi: Mengelola visualisasi 3 halaman HTML, pencarian database Member, 
 * dan mesin kamus cadangan AI Nur Indramayu.
 */

// Folder ID Utama dari susunan nur_hecker.js
const FOLDER_ID = "1Oxz3D7AcWqGgCLv70EgGAImPLcmrmdI1";

// Database Simpanan 10 Akun Cadangan Protokol Piramida Guard (dari nur_hecker.js)
const MULTI_ACCOUNT_DATA = {
  "main":  { name: "Sistem Utama", saldo: "Rp 12.450.000", node: "HDD2JM4_MAIN", status: "Active" },
  "nur1":  { name: "Folder Kas 1", saldo: "Rp 5.200.000",  node: "HDD2JM4_N1",   status: "Backup" },
  "nur2":  { name: "Folder Kas 2", saldo: "Rp 4.850.000",  node: "HDD2JM4_N2",   status: "Backup" },
  "nur3":  { name: "Folder Kas 3", saldo: "Rp 7.120.000",  node: "HDD2JM4_N3",   status: "Active" },
  "nur4":  { name: "Folder Kas 4", saldo: "Rp 3.900.000",  node: "HDD2JM4_N4",   status: "Backup" },
  "nur5":  { name: "Folder Kas 5", saldo: "Rp 6.340.000",  node: "HDD2JM4_N5",   status: "Active" },
  "nur6":  { name: "Administrasi", saldo: "Potongan 5%",    node: "HDD2JM4_N6",   status: "System" },
  "nur7":  { name: "Komunikasi",   saldo: "Sapa Member",    node: "HDD2JM4_N7",   status: "Active" },
  "nur8":  { name: "Backup Core",  saldo: "Reset Adzan",    node: "HDD2JM4_N8",   status: "Standby" },
  "nur9":  { name: "Pembimbing",   saldo: "AI Nur Mini",    node: "HDD2JM4_N9",   status: "Active" }
};

// Database Kamus Utama Cadangan AI Nur Indramayu
const KAMUS_DERMAYU = {
  "kula": { indonesia: "saya", pasar: "kula (formal)", kategori: "Kata Ganti" },
  "isun": { indonesia: "aku", pasar: "reang / isun", kategori: "Kata Ganti" },
  "sira": { indonesia: "kamu", pasar: "ira / sira", kategori: "Kata Ganti" },
  "rika": { indonesia: "kamu (lebih sopan/tua)", pasar: "rika", kategori: "Kata Ganti" },
  "sampeyan": { indonesia: "anda", pasar: "sampeyan", kategori: "Kata Ganti" },
  "reang": { indonesia: "saya/aku", pasar: "reang (akrab/tongkrongan)", kategori: "Kata Ganti" },
  "ira": { indonesia: "kamu", pasar: "ira (akrab/tongkrongan)", kategori: "Kata Ganti" },
  "priben": { indonesia: "bagaimana", pasar: "priben / kepriben", kategori: "Kata Tanya" },
  "saiki": { indonesia: "sekarang", pasar: "saiki / kien", kategori: "Waktu" },
  "mangan": { indonesia: "makan", pasar: "mangan / madang", kategori: "Kata Kerja" },
  "turu": { indonesia: "tidur", pasar: "turu / merem", kategori: "Kata Kerja" },
  "langka": { indonesia: "tidak ada", pasar: "langka / laka", kategori: "Umum" },
  "ora": { indonesia: "tidak", pasar: "ora / dudu", kategori: "Umum" },
  "macek": { indonesia: "memasang bata/ubin", pasar: "macek / masang", kategori: "Tukang" },
  "luluh": { indonesia: "adukan semen", pasar: "luluh / luluhan", kategori: "Tukang" }
};

// =============================================================================
// FUNCTION DOGET - ROUTING MULTIPAGE & API INTERACTION (Mendukung Web App & API)
// =============================================================================
function doGet(e) {
  var action = e.parameter.action;
  var query = e.parameter.query;
  var halaman = e.parameter.p; // Parameter perpindahan halaman (?p=...)
  
  // -- SEKTOR ROUTING HTML VISUAL --
  if (halaman === "dashboard") {
    return HtmlService.createTemplateFromFile('dasbord').evaluate()
        .setTitle('Dashboard Piramida Guard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if (halaman === "media") {
    return HtmlService.createTemplateFromFile('media').evaluate()
        .setTitle('Media Platform - Indramayu Club')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if (halaman === "index" || (!halaman && !action)) {
    return HtmlService.createTemplateFromFile('index').evaluate()
        .setTitle('Launcher Indramayu Club')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // -- SEKTOR JALUR API JSON (Cadangan API jika Web Terjadi Limit) --
  var output = {};
  
  if (action === "search" && query) {
    // 1. Logika pencarian data member asli Bapak di Google Sheets
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data_Member");
      var data = sheet.getDataRange().getValues();
      var results = [];
      for (var i = 1; i < data.length; i++) {
        if (data[i][1].toString().toLowerCase().indexOf(query.toLowerCase()) !== -1) {
          results.push({ nama: data[i][1], gender: data[i][2], lencana: data[i][3] });
        }
      }
      output.results = results;
    } catch(err) {
      output.results = [];
      output.error = "Sheet Data_Member tidak ditemukan.";
    }
  } else if (action === "account" && e.parameter.key) {
    // 2. Mengambil data multi-account Piramida Guard secara instan via API
    var accKey = e.parameter.key;
    if (MULTI_ACCOUNT_DATA[accKey]) {
      output.status = "success";
      output.detail = MULTI_ACCOUNT_DATA[accKey];
    } else {
      output.status = "error";
      output.pesan = "Node akun tidak valid.";
    }
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET'
    });
}

// =============================================================================
// MESIN PROSES CHAT BOT NUR AI (Dipanggil Asinkronus oleh Messenger HTML)
// =============================================================================
function prosesPesanNurAI(pesanTeks) {
  var pesanMasuk = (pesanTeks || "").toLowerCase().trim();
  if (!pesanMasuk) return "Pesan kosong, ada yang bisa Nur bantu, Pak?";

  // 1. Validasi Sandi Utama Bapak
  if (pesanMasuk.includes('nur000555')) {
    return "hadir pak dulKohar";
  }

  // 2. Deteksi Kata dari Kamus Cadangan Indramayu (nur_hecker.js core)
  var kataKata = pesanMasuk.split(/\s+/);
  for (var i = 0; i < kataKata.length; i++) {
    var kata tunggal = kataKata[i];
    if (KAMUS_DERMAYU[tunggal]) {
      var d = KAMUS_DERMAYU[tunggal];
      return "Nur AI mendeteksi kata '" + tunggal + "' (" + d.kategori + "). Arti Indonesianya: '" + d.indonesia + "', Bahasa akrab/pasar: '" + d.pasar + "'.";
    }
  }

  // 3. Respon Spiritual Makrifat
  if (pesanMasuk.includes('makrifat') || pesanMasuk.includes('spiritual')) {
    return "Mencapai makrifat adalah perjalanan mengenal diri seutuhnya untuk berserah pada takdir tertinggi, Pak Jamhari. Tetap fokus pada esensi spiritual.";
  }

  // 4. Default Respon Keamanan Piramida Guard
  var responPiramida = [
    "Sistem siaga. Aktivitas terpantau normal oleh Piramida Guard. ⚙️",
    "MasyaAllah, pesan tersimpan di node cadangan aman, Pak. 🌟",
    "Semua 9 akun perwakilan Nur beroperasi dalam parameter stabil. ✅"
  ];
  return responPiramida[Math.floor(Math.random() * responPiramida.length)];
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

