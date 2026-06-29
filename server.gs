/**
 * ====================================================================
 * INDRAMAYU CLUB MAKRIFAT - CORE BACKEND ENGINE (server.gs)
 * ====================================================================
 * Otoritas Obyek: Admin Utama (JAMHARI DULKOHAR)
 * Sinkronisasi: Android Termux (PiramidaGuard) & GitHub Enterprise
 */

// 1. Database Internal Proteksi Member (Android Level)
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
  }
};

/**
 * Mengambil data detail member berdasarkan nama secara aman (diakses oleh Frontend)
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
      data: { avatar: "?", badge: "BRONZE", role: "Anggota Anyar", sapa: "Selamat datang di Indramayu Club!" }
    };
  }
}

/**
 * Mengambil Statistik Dashboard Utama
 */
function dapatkanStatistikSistem() {
  return {
    totalMember: Object.keys(DATABASE_MEMBER).length,
    postAktif: 37,
    memberOnline: 12,
    kasNegara: "Rp 2.4M",
    statusAi: "READY"
  };
}

/**
 * Menyimpan Postingan Baru dari Composer ke Script Cache atau Log Penampung
 */
function simpanPostinganBaru(textContent, mediaUrl) {
  try {
    var userProperties = PropertiesService.getUserProperties();
    var posts = userProperties.getProperty('FEED_POSTS');
    var postList = posts ? JSON.parse(posts) : [];
    
    var newPost = {
      nama: "Pak Jamhari",
      waktu: new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }),
      text: textContent,
      media: mediaUrl,
      timestamp: new Date().getTime()
    };
    
    postList.unshift(newPost); // Taruh di paling atas
    // Batasi maks 20 post agar penyimpanan internal tidak penuh
    if(postList.length > 20) postList.pop();
    
    userProperties.setProperty('FEED_POSTS', JSON.stringify(postList));
    return { success: true, message: "Postingan berhasil disimpan di Nur Engine Server!" };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Mengambil Seluruh Postingan Feed dari Server
 */
function ambilSemuaPostingan() {
  var userProperties = PropertiesService.getUserProperties();
  var posts = userProperties.getProperty('FEED_POSTS');
  return posts ? JSON.parse(posts) : [];
}

