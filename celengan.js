/**
 * ====================================================================
 * INDRAMAYU CLUB MAKRIFAT - CORE BACKEND SYSTEM (NUR ENGINE)
 * ====================================================================
 * Otoritas Obyek: Admin Utama (JAMHARI DULKOHAR)
 * Deskripsi: Pusat kendali administrasi, otentikasi member, dan data gawai.
 */

// 1. Fungsi Utama Rendring UI Administrasi
function doGet(e) {
  return HtmlService.createTemplateFromFile('administrasi')
      .evaluate()
      .setTitle('Pusat Kendali - Indramayu Club Makrifat')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 2. Database Internal Proteksi Member (Android Level)
const DATABASE_MEMBER = {
  "Pak Jamhari": { 
    avatar: "J", 
    badge: "PLATINUM", 
    role: "Admin Utama", 
    sapa: "Sugeng enjing sedulur Indramayu Club Makrifat! Jaga sistem tetep aman." 
  },
  "Ahmad Fauzi": { 
    avatar: "A", 
    badge: "SILVER", 
    role: "Member Prioritas", 
    sapa: "Priben kabare batur? Ayo dolan bareng ing folder komunitas." 
  },
  "Siti Nurhaliza": { 
    avatar: "S", 
    badge: "GOLD", 
    role: "Member VVIP", 
    sapa: "Keren pisan platform niki, teknologi lan budayane mentes!" 
  },
  "Dewi Safitri": { 
    avatar: "D", 
    badge: "PLATINUM", 
    role: "Arsitek Basis Data", 
    sapa: "Salam makrifat, integrasi Termux lan API cloud sampun lancar." 
  },
  "Pak Jamhari": {
    avatar: "J",                                                                            badge: "PLATINUM",
    role: "Admin Utama",
    sapa: "Sugeng enjing sedulur Indramayu Club Makrifat! Jaga sistem tetep aman."
  },                                                                                      "Ahmad Fauzi": {
    avatar: "A",                                                                            badge: "SILVER",
    role: "Member Prioritas",
    sapa: "Priben kabare batur? Ayo dolan bareng ing folder komunitas."                   },
  "Siti Nurhaliza": {                                                                       avatar: "S",
    badge: "GOLD",
    role: "Member VVIP",                                                                    sapa: "Keren pisan platform niki, teknologi lan budayane mentes!"
  },
  "Dewi Safitri": {
    avatar: "D",
    badge: "PLATINUM",
    role: "Arsitek Basis Data",
    sapa: "Salam makrifat, integrasi Termux lan API cloud sampun lancar."
  }

};

/**
 * Mengambil data detail member berdasarkan nama secara aman (diakses oleh Frontend)
 * @param {string} nama - Nama member yang dicari
 * @return {object} Data profil lengkap member
 */
function dapatkanDetailMember(nama) {
  if (DATABASE_MEMBER[nama]) {
    return {
      success: true,
      data: DATABASE_MEMBER[nama]
    };
  } else {
    return {
      success: false,
      data: { avatar: "?", badge: "BRONZE", role: "Anggota Anyar", sapa: "Sugeng rawuh ing Indramayu Club!" }
    };
  }
}

/**
 * Fungsi utilitas untuk mencatat log aktivitas sistem lokal Termux/Acode
 * @param {string} aktivitas - Deskripsi aktivitas admin/member
 */
function catatLogSistem(aktivitas) {
  const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  Logger.log(`[${waktu}] Otoritas Nur: ${aktivitas}`);
  return true;
}

function doGet(e) {
  // Ambil parameter halaman, default ke administrasi jika kosong                         var page = e.parameter.p || 'administrasi';

  var htmlFile;                                                                           switch(page) {
    case 'android': htmlFile = 'android'; break;                                            case 'halaman2': htmlFile = 'halaman2'; break;
    case 'kamus': htmlFile = 'kamus'; break;                                                case 'administrasi':                                                                    default:                                                                                  htmlFile = 'administrasi';
      break;
  }

  // 1. Buat template dari file html yang dipilih
  var template = HtmlService.createTemplateFromFile(htmlFile);

  // 2. Oper parameter 'e' ke dalam HTML agar dropdown tahu halaman aktif saat ini
  template.e = e;

  // 3. Evaluasi dan kirimkan outputnya ke browser
  return template.evaluate()                                                                  .setTitle('Indramayu Club Makrifat')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

}',
