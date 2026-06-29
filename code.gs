/**
 * ===================================================================
 * INDRAMAYU CLUB MAKRIFAT - CORE ROUTER ENGINE (WITHOUT EXTERNAL SERVER)
 * ===================================================================
 * Otoritas Jalur: Nur Makrifat (RpNUR, VOUCHER NUR, GIF NUR)
 * Pendukung Terminal: Termux Environment (Acode / Android OS)
 */

// Konfigurasi Penyimpanan Kunci Sementara & Nilai Makrifat (Sebagai pengganti Database fisik)
const CACHE_NUR = PropertiesService.getScriptProperties();

// Inisialisasi Data Awal jika Cache Kosong (Otomatis Terisi)
function initDatabaseNur() {
  if (!CACHE_NUR.getProperty("RP_NUR_TOTAL")) {
    CACHE_NUR.setProperty("RP_NUR_TOTAL", "125500000"); // Contoh Saldo Awal RpNUR Komunitas
    CACHE_NUR.setProperty("VOUCHER_NUR_ACTIVE", "NUR-99-VIP, NUR-55-BLAST, NUR-MAKRIFAT-2026");
    CACHE_NUR.setProperty("GIF_NUR_STOCKS", "150");
  }
}

/**
 * ═══ GERBANG UTAMA TERMINAL & WEB (doGet) ═══
 * Melayani request halaman dari Browser dan request Data API dari Termux Engine
 */
function doGet(e) {
  // Pastikan data awal terkonfigurasi
  initDatabaseNur();
  
  // Ambil parameter perintah 'p' untuk Router Halaman, atau 'action' untuk Router API Termux
  var page = e.parameter.p || 'administrasi';
  var action = e.parameter.action;

  // JALUR 1: Jika request datang dari Termux (Meminta Data API format JSON)
  if (action) {
    return layaniRequestTermux(action, e);
  }

  // JALUR 2: Jika request datang dari Web Browser (Merender UI HTML Komunitas)
  var htmlFile;
  switch(page) {
    case 'bagian1': 
      htmlFile = 'bagian1'; 
      break;
    case 'bagian2': 
      htmlFile = 'bagian2'; 
      break;
    case 'android': 
      htmlFile = 'android'; 
      break;
    case 'kamus': 
      htmlFile = 'kamus'; 
      break;
   case 'celengan': 
      htmlFile = 'celengan'; 
      break;
    case 'administrasi':
    default:
      htmlFile = 'administrasi';
      break;
  }
  
  // Buat template HTML dinamis
  var template = HtmlService.createTemplateFromFile(htmlFile);
  
  // Oper parameter ke dalam objek HTML agar dropdown mengetahui letak posisi halaman aktif
  template.e = e; 
  
  return template.evaluate()
      .setTitle('Pusat Kendali - Indramayu Club Makrifat')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ═══ FUNGSI KENDALI API TERMUX ENGINE ═══
 * Tanpa server, Termux cukup melakukan perintah: curl "URL_DEPLOYMENT?action=CEK_ASET"
 */
function layaniRequestTermux(action, e) {
  var output = { status: "error", message: "Perintah Otoritas Nur Tidak Dikenali" };
  
  switch(action) {
    case 'cek_aset':
      output = {
        status: "success",
        operator: "Nur Makrifat Terminal",
        timestamp: new Date().toISOString(),
        aset: {
          rpNur: "Rp " + parseInt(CACHE_NUR.getProperty("RP_NUR_TOTAL")).toLocaleString("id-ID"),
          voucherNur: CACHE_NUR.getProperty("VOUCHER_NUR_ACTIVE").split(", "),
          gifNurCount: CACHE_NUR.getProperty("GIF_NUR_STOCKS") + " Unit"
        }
      };
      break;
      
    case 'gunakan_voucher':
      var kodeVoucher = e.parameter.kode;
      var voucherAktif = CACHE_NUR.getProperty("VOUCHER_NUR_ACTIVE") || "";
      
      if (kodeVoucher && voucherAktif.includes(kodeVoucher)) {
        output = {
          status: "success",
          message: "Aktivasi Berhasil",
          detail: "Voucher " + kodeVoucher + " terverifikasi di Sektor Utama."
        };
      } else {
        output = {
          status: "failed",
          message: "Kode Voucher Nur Tidak Sah atau Sudah Kedaluwarsa!"
        };
      }
      break;
      
    case 'update_rpnur':
      var jumlahBaru = e.parameter.jumlah;
      if (jumlahBaru) {
        CACHE_NUR.setProperty("RP_NUR_TOTAL", jumlahBaru);
        output = { status: "success", message: "Sinkronisasi Saldo RpNUR Berhasil Diperbarui" };
      }
      break;
  }
  
  // Kembalikan dalam bentuk JSON Text Output aman agar bisa dibaca Termux (jq / python)
  return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
}

/**
 * JALUR CADANGAN: doPost untuk penanganan enkripsi data tingkat tinggi jika diperlukan
 */
function doPost(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "secured", message: "Jalur Post Terkunci" }))
      .setMimeType(ContentService.MimeType.JSON);
}

