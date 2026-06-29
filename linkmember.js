// â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
// â•‘  INDRAMAYU CLUB MAKRIFAT â€” Member System v1.0       â•‘
// â•‘  Google Apps Script Â· doGet/doPost Router            â•‘
// â•‘  Data: Google Sheets + PropertiesService (JSON)     â•‘
// â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ KONFIGURASI â”€â”€
const CONFIG = {
  SHEET_ID       : 'PASTE_GOOGLE_SHEET_ID_DISINI',  // Ganti dengan Sheet ID Anda
  SHEET_MEMBER   : 'Members',
  SHEET_TRANSAKSI: 'Transaksi',
  MAX_VVIP       : 10,       // Hanya 10 member pertama dapat bonus VVIP
  BONUS_SALDO    : 50000,    // Saldo awal gratis Rp 50.000
  BONUS_DISKON   : 5,        // Diskon kas 5% selamanya
  SECRET_KEY     : 'INDRAMAYU_CLUB_2026', // Untuk hash sederhana
};

// â”€â”€ TIER MEMBER â”€â”€
const TIER = {
  VVIP  : { label:'VVIP',    badge:'ðŸ‘‘', diskon:5,  warna:'#FFD700', minDeposit:0     },
  PLATINUM:{ label:'Platinum',badge:'ðŸ’Ž', diskon:3,  warna:'#E8EAF6', minDeposit:500000},
  GOLD  : { label:'Gold',    badge:'â­', diskon:2,  warna:'#FFF8E1', minDeposit:200000},
  SILVER: { label:'Silver',  badge:'ðŸ¥ˆ', diskon:1,  warna:'#ECEFF1', minDeposit:100000},
  BRONZE: { label:'Bronze',  badge:'ðŸ¥‰', diskon:0,  warna:'#FBE9E7', minDeposit:0     },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ROUTER UTAMA
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function doGet(e) {
  const page   = e.parameter.page   || 'home';
  const action = e.parameter.action || '';

  // API calls (JSON response)
  if (page === 'api') return handleApi(e);

  // HTML Pages
  if (page === 'register') return renderHtml(getRegisterHtml(), 'Daftar Member');
  if (page === 'login')    return renderHtml(getLoginHtml(),    'Login Member');
  if (page === 'dashboard')return renderHtml(getDashboardHtml(),'Dashboard Member');
  if (page === 'admin')    return renderHtml(getAdminHtml(),    'Admin Panel');

  return renderHtml(getHomeHtml(), 'Indramayu Club Â· Member');
}

function doPost(e) {
  return handleApi(e);
}

function renderHtml(html, title) {
  return HtmlService.createHtmlOutput(html)
    .setTitle(title + ' Â· Indramayu Club')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API HANDLER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function handleApi(e) {
  const action = e.parameter.action || (e.postData ? JSON.parse(e.postData.contents).action : '');
  let body = {};
  try { if (e.postData) body = JSON.parse(e.postData.contents); } catch(x){}

  // Merge GET params
  const p = Object.assign({}, e.parameter, body);

  let result;
  try {
    if (action === 'register') result = apiRegister(p);
    else if (action === 'login')    result = apiLogin(p);
    else if (action === 'profile')  result = apiProfile(p);
    else if (action === 'members')  result = apiGetMembers(p);
    else if (action === 'stats')    result = apiStats();
    else if (action === 'vvip_slot')result = apiVvipSlot();
    else result = { ok: false, msg: 'Action tidak dikenal: ' + action };
  } catch(err) {
    result = { ok: false, msg: 'Error server: ' + err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API: REGISTER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function apiRegister(p) {
  const nama     = (p.nama     || '').trim();
  const username = (p.username || '').trim().toLowerCase();
  const password = (p.password || '').trim();
  const phone    = (p.phone    || '').trim();
  const kota     = (p.kota    || 'Indramayu').trim();

  // Validasi
  if (!nama || !username || !password || !phone)
    return { ok:false, msg:'Semua field wajib diisi!' };
  if (username.length < 4)
    return { ok:false, msg:'Username minimal 4 karakter!' };
  if (password.length < 6)
    return { ok:false, msg:'Password minimal 6 karakter!' };
  if (!/^[0-9]{9,13}$/.test(phone))
    return { ok:false, msg:'Nomor HP tidak valid (9-13 digit)!' };

  // Cek username sudah ada
  const existing = getMemberByUsername(username);
  if (existing) return { ok:false, msg:'Username sudah dipakai, coba yang lain!' };

  // Tentukan tier & bonus VVIP
  const totalMember = getTotalMember();
  const isVvip      = totalMember < CONFIG.MAX_VVIP;
  const tier        = isVvip ? 'VVIP' : 'BRONZE';
  const bonusSaldo  = isVvip ? CONFIG.BONUS_SALDO : 0;
  const nomorUrut   = totalMember + 1;
  const memberId    = 'ICM' + String(nomorUrut).padStart(4, '0');

  const now    = new Date();
  const tglStr = Utilities.formatDate(now, 'Asia/Pontianak', 'dd-MM-yyyy HH:mm:ss');

  const member = {
    id        : memberId,
    nama      : nama,
    username  : username,
    password  : hashSimple(password),
    phone     : phone,
    kota      : kota,
    tier      : tier,
    saldo     : bonusSaldo,
    diskon    : isVvip ? CONFIG.BONUS_DISKON : 0,
    isVvip    : isVvip,
    nomorUrut : nomorUrut,
    tglDaftar : tglStr,
    lastLogin : '',
    status    : 'aktif',
  };

  // Simpan ke Sheets
  saveMemberToSheet(member);

  // Simpan ke JSON Properties (backup)
  saveMemberToProperties(member);

  // Catat transaksi bonus
  if (bonusSaldo > 0) {
    catatTransaksi({
      memberId : memberId,
      nama     : nama,
      tipe     : 'BONUS_VVIP',
      nominal  : bonusSaldo,
      keterangan: 'Bonus saldo awal VVIP member ke-' + nomorUrut,
      tgl      : tglStr,
    });
  }

  return {
    ok      : true,
    msg     : isVvip
      ? 'ðŸŽ‰ Selamat! Anda adalah member VVIP ke-' + nomorUrut + '! Bonus Rp ' + formatRp(bonusSaldo) + ' telah dikreditkan!'
      : 'âœ… Registrasi berhasil! Selamat datang di Indramayu Club, ' + nama + '!',
    member  : {
      id       : memberId,
      nama     : nama,
      username : username,
      tier     : tier,
      badge    : TIER[tier].badge,
      saldo    : bonusSaldo,
      diskon   : isVvip ? CONFIG.BONUS_DISKON : 0,
      isVvip   : isVvip,
      nomorUrut: nomorUrut,
    },
    redirect: getScriptUrl() + '?page=dashboard&token=' + makeToken(username),
  };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API: LOGIN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function apiLogin(p) {
  const username = (p.username || '').trim().toLowerCase();
  const password = (p.password || '').trim();

  if (!username || !password)
    return { ok:false, msg:'Username dan password wajib diisi!' };

  const member = getMemberByUsername(username);
  if (!member)
    return { ok:false, msg:'Username tidak ditemukan!' };

  if (member.password !== hashSimple(password))
    return { ok:false, msg:'Password salah!' };

  if (member.status !== 'aktif')
    return { ok:false, msg:'Akun Anda tidak aktif. Hubungi Admin.' };

  // Update last login
  updateLastLogin(username);

  const tier = TIER[member.tier] || TIER.BRONZE;

  return {
    ok     : true,
    msg    : 'Sugeng rawuh, ' + member.nama + '! ' + tier.badge,
    member : {
      id      : member.id,
      nama    : member.nama,
      username: member.username,
      tier    : member.tier,
      badge   : tier.badge,
      saldo   : member.saldo,
      diskon  : member.diskon,
      isVvip  : member.isVvip,
    },
    token   : makeToken(username),
    redirect: getScriptUrl() + '?page=dashboard&token=' + makeToken(username),
  };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API: PROFILE (dari token)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function apiProfile(p) {
  const username = verifyToken(p.token || '');
  if (!username) return { ok:false, msg:'Sesi tidak valid, silakan login ulang.' };

  const member = getMemberByUsername(username);
  if (!member)  return { ok:false, msg:'Member tidak ditemukan.' };

  const tier = TIER[member.tier] || TIER.BRONZE;
  return {
    ok    : true,
    member: {
      id       : member.id,
      nama     : member.nama,
      username : member.username,
      phone    : member.phone,
      kota     : member.kota,
      tier     : member.tier,
      badge    : tier.badge,
      warnaTier: tier.warna,
      saldo    : Number(member.saldo),
      diskon   : Number(member.diskon),
      isVvip   : member.isVvip === 'true' || member.isVvip === true,
      nomorUrut: member.nomorUrut,
      tglDaftar: member.tglDaftar,
      lastLogin: member.lastLogin,
    }
  };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API: STATS & VVIP SLOT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function apiStats() {
  const total  = getTotalMember();
  const vvip   = getVvipCount();
  const sisa   = Math.max(0, CONFIG.MAX_VVIP - vvip);
  return {
    ok          : true,
    totalMember : total,
    vvipTerisi  : vvip,
    vvipSisa    : sisa,
    maxVvip     : CONFIG.MAX_VVIP,
    vvipMasihAda: sisa > 0,
  };
}

function apiVvipSlot() {
  const sisa = Math.max(0, CONFIG.MAX_VVIP - getVvipCount());
  return {
    ok   : true,
    sisa : sisa,
    masihAda: sisa > 0,
    msg  : sisa > 0
      ? 'ðŸ”¥ Sisa ' + sisa + ' slot VVIP! Daftar sekarang!'
      : 'âŒ Slot VVIP sudah habis.',
  };
}

function apiGetMembers(p) {
  // Hanya untuk admin (bisa ditambah auth)
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_MEMBER);
  if (!sheet) return { ok:false, msg:'Sheet tidak ditemukan' };

  const data  = sheet.getDataRange().getValues();
  const headers = data[0];
  const members = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => { obj[h] = row[i]; });
    // Jangan tampilkan password
    delete obj.password;
    return obj;
  });

  return { ok:true, total:members.length, data:members };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GOOGLE SHEETS HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function getSheet(name) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet   = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Buat header
    if (name === CONFIG.SHEET_MEMBER) {
      sheet.appendRow(['id','nama','username','password','phone','kota','tier',
        'saldo','diskon','isVvip','nomorUrut','tglDaftar','lastLogin','status']);
      sheet.getRange(1,1,1,14).setFontWeight('bold').setBackground('#1a6b3a').setFontColor('#ffffff');
    }
    if (name === CONFIG.SHEET_TRANSAKSI) {
      sheet.appendRow(['memberId','nama','tipe','nominal','keterangan','tgl']);
      sheet.getRange(1,1,1,6).setFontWeight('bold').setBackground('#C9A84C').setFontColor('#000000');
    }
  }
  return sheet;
}

function saveMemberToSheet(m) {
  const sheet = getSheet(CONFIG.SHEET_MEMBER);
  sheet.appendRow([
    m.id, m.nama, m.username, m.password, m.phone, m.kota,
    m.tier, m.saldo, m.diskon, m.isVvip, m.nomorUrut,
    m.tglDaftar, m.lastLogin, m.status
  ]);

  // Warna baris VVIP emas
  if (m.isVvip) {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 14).setBackground('#FFF8E1');
  }
}

function catatTransaksi(t) {
  const sheet = getSheet(CONFIG.SHEET_TRANSAKSI);
  sheet.appendRow([t.memberId, t.nama, t.tipe, t.nominal, t.keterangan, t.tgl]);
}

function getMemberByUsername(username) {
  // Coba dari Properties dulu (lebih cepat)
  try {
    const props = PropertiesService.getScriptProperties();
    const raw   = props.getProperty('member_' + username);
    if (raw) return JSON.parse(raw);
  } catch(e) {}

  // Fallback ke Sheets
  try {
    const sheet  = getSheet(CONFIG.SHEET_MEMBER);
    const data   = sheet.getDataRange().getValues();
    const headers= data[0];
    const usrIdx = headers.indexOf('username');
    for (let i = 1; i < data.length; i++) {
      if (data[i][usrIdx] === username) {
        const obj = {};
        headers.forEach((h,j) => { obj[h] = data[i][j]; });
        return obj;
      }
    }
  } catch(e) {}
  return null;
}

function getTotalMember() {
  try {
    const sheet = getSheet(CONFIG.SHEET_MEMBER);
    return Math.max(0, sheet.getLastRow() - 1);
  } catch(e) { return 0; }
}

function getVvipCount() {
  try {
    const sheet   = getSheet(CONFIG.SHEET_MEMBER);
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const tierIdx = headers.indexOf('tier');
    return data.slice(1).filter(r => r[tierIdx] === 'VVIP').length;
  } catch(e) { return 0; }
}

function updateLastLogin(username) {
  try {
    const now  = Utilities.formatDate(new Date(), 'Asia/Pontianak', 'dd-MM-yyyy HH:mm:ss');
    const sheet= getSheet(CONFIG.SHEET_MEMBER);
    const data = sheet.getDataRange().getValues();
    const hdrs = data[0];
    const usrIdx  = hdrs.indexOf('username');
    const loginIdx= hdrs.indexOf('lastLogin');
    for (let i = 1; i < data.length; i++) {
      if (data[i][usrIdx] === username) {
        sheet.getRange(i+1, loginIdx+1).setValue(now);
        break;
      }
    }
    // Update di Properties juga
    const props = PropertiesService.getScriptProperties();
    const raw   = props.getProperty('member_' + username);
    if (raw) {
      const m = JSON.parse(raw);
      m.lastLogin = now;
      props.setProperty('member_' + username, JSON.stringify(m));
    }
  } catch(e) {}
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PROPERTIES (JSON BACKUP)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function saveMemberToProperties(m) {
  try {
    const props = PropertiesService.getScriptProperties();
    // Simpan per user
    props.setProperty('member_' + m.username, JSON.stringify(m));
    // Update index daftar username
    const idx = props.getProperty('member_index') || '[]';
    const list = JSON.parse(idx);
    if (!list.includes(m.username)) list.push(m.username);
    props.setProperty('member_index', JSON.stringify(list));
    // Update counter
    props.setProperty('total_member', String(m.nomorUrut));
  } catch(e) {}
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AUTH HELPERS â€” token sederhana (base64)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function makeToken(username) {
  const payload = username + '|' + CONFIG.SECRET_KEY + '|' + new Date().toDateString();
  return Utilities.base64Encode(payload);
}

function verifyToken(token) {
  try {
    const decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    const parts   = decoded.split('|');
    if (parts[1] !== CONFIG.SECRET_KEY) return null;
    if (parts[2] !== new Date().toDateString()) return null; // Token expired next day
    return parts[0]; // username
  } catch(e) { return null; }
}

function hashSimple(str) {
  // Hash sederhana untuk GAS (bukan bcrypt, tapi cukup untuk komunitas)
  let hash = 0;
  const s  = str + CONFIG.SECRET_KEY;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

function formatRp(n) {
  return new Intl.NumberFormat('id-ID').format(n);
}

function getScriptUrl() {
  try { return ScriptApp.getService().getUrl(); }
  catch(e) { return '#'; }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HTML: HOME
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function getHomeHtml() {
  const url = getScriptUrl();
  return `<!DOCTYPE html><html lang="id"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Indramayu Club</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0d0d0d;color:#e8d5a0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
.card{background:linear-gradient(135deg,#1a1408,#0d0a02);border:1px solid #3a2c0a;border-radius:20px;padding:40px 32px;text-align:center;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(201,168,76,0.1)}
.logo{font-size:48px;margin-bottom:8px}
h1{font-size:22px;color:#c9a84c;letter-spacing:2px;margin-bottom:4px}
.sub{font-size:12px;color:#9a8050;letter-spacing:3px;margin-bottom:24px}
.vvip-banner{background:linear-gradient(135deg,#7a5c1e,#c9a84c,#f0d070,#c9a84c);border-radius:12px;padding:16px;margin-bottom:24px;color:#000;animation:glow 2s ease-in-out infinite}
@keyframes glow{0%,100%{box-shadow:0 0 10px #c9a84c50}50%{box-shadow:0 0 25px #c9a84c90}}
.vvip-title{font-size:16px;font-weight:800;letter-spacing:1px}
.vvip-desc{font-size:12px;margin-top:4px;opacity:0.8}
.slot-counter{font-size:24px;font-weight:900;color:#c9a84c;margin:4px 0}
.btn{display:block;width:100%;padding:14px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:10px;transition:all 0.2s;border:none;cursor:pointer;letter-spacing:0.5px}
.btn-vvip{background:linear-gradient(135deg,#c9a84c,#f0d070);color:#000}
.btn-vvip:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.4)}
.btn-login{background:transparent;border:1.5px solid #3a2c0a;color:#c9a84c}
.btn-login:hover{background:#1a1408}
.bonus-list{text-align:left;margin-bottom:20px}
.bonus-item{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #2a1f05;font-size:13px}
.bonus-item:last-child{border:none}
.bonus-icon{font-size:18px;flex-shrink:0}
</style>
</head><body>
<div class="card">
  <div class="logo">ê¦†</div>
  <h1>INDRAMAYU CLUB</h1>
  <div class="sub">MAKRIFAT Â· MEMBER SYSTEM</div>

  <div class="vvip-banner">
    <div class="vvip-title">ðŸ‘‘ SLOT VVIP TERBATAS!</div>
    <div class="slot-counter" id="slotCount">â³</div>
    <div class="vvip-desc">slot tersisa dari ${CONFIG.MAX_VVIP} slot eksklusif</div>
  </div>

  <div class="bonus-list">
    <div class="bonus-item"><span class="bonus-icon">ðŸ’°</span><div><strong>Saldo Awal Rp 50.000</strong><br><small style="color:#9a8050">Dikreditkan otomatis saat daftar</small></div></div>
    <div class="bonus-item"><span class="bonus-icon">ðŸ·ï¸</span><div><strong>Diskon Kas 5% Selamanya</strong><br><small style="color:#9a8050">Hemat di setiap transaksi Bank Makrifat</small></div></div>
    <div class="bonus-item"><span class="bonus-icon">ðŸ‘‘</span><div><strong>Badge VVIP + Akses Eksklusif</strong><br><small style="color:#9a8050">Fitur & konten khusus member VVIP</small></div></div>
  </div>

  <a href="${url}?page=register" class="btn btn-vvip">ðŸš€ DAFTAR SEKARANG â€” GRATIS!</a>
  <a href="${url}?page=login" class="btn btn-login">ðŸ”‘ Sudah Punya Akun? Login</a>
  <div style="font-size:10px;color:#5a4a20;margin-top:16px;letter-spacing:2px">Â© 2026 INDRAMAYU CLUB MAKRIFAT</div>
</div>
<script>
  fetch('${url}?page=api&action=vvip_slot')
    .then(r=>r.json()).then(d=>{
      document.getElementById('slotCount').textContent = d.sisa;
    }).catch(()=>{document.getElementById('slotCount').textContent='?'});
</script>
</body></html>`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HTML: REGISTER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function getRegisterHtml() {
  const url = getScriptUrl();
  return `<!DOCTYPE html><html lang="id"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0d0d0d;color:#e8d5a0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
.card{background:linear-gradient(135deg,#1a1408,#0d0a02);border:1px solid #3a2c0a;border-radius:20px;padding:32px 28px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(201,168,76,0.1)}
.logo-row{text-align:center;margin-bottom:20px}
.logo-row h1{font-size:20px;color:#c9a84c;letter-spacing:2px}
.vvip-badge{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#7a5c1e,#c9a84c);color:#000;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;margin-top:6px;letter-spacing:1px}
.slot-info{background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:10px;padding:12px;margin-bottom:20px;text-align:center;font-size:13px}
.slot-num{font-size:28px;font-weight:900;color:#c9a84c}
.field{margin-bottom:14px}
label{display:block;font-size:11px;color:#9a8050;letter-spacing:2px;text-transform:uppercase;margin-bottom:5px}
input,select{width:100%;background:#1e1608;border:1.5px solid #3a2c0a;color:#e8d5a0;font-size:14px;padding:11px 14px;border-radius:8px;outline:none;transition:border-color 0.2s}
input:focus,select:focus{border-color:#c9a84c}
input::placeholder{color:#5a4a20}
.btn{width:100%;padding:14px;border-radius:10px;font-size:15px;font-weight:700;border:none;cursor:pointer;margin-top:6px;letter-spacing:0.5px;transition:all 0.2s}
.btn-submit{background:linear-gradient(135deg,#c9a84c,#f0d070);color:#000}
.btn-submit:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.4)}
.btn-submit:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.alert{border-radius:8px;padding:12px;font-size:13px;margin-top:12px;display:none}
.alert-err{background:rgba(220,53,69,0.15);border:1px solid rgba(220,53,69,0.3);color:#ff6b7a}
.alert-ok{background:rgba(40,167,69,0.15);border:1px solid rgba(40,167,69,0.3);color:#51cf66}
.login-link{text-align:center;margin-top:16px;font-size:13px;color:#9a8050}
.login-link a{color:#c9a84c;text-decoration:none;font-weight:600}
.bonus-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.chip{background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.2);border-radius:20px;padding:4px 10px;font-size:11px;color:#c9a84c}
</style>
</head><body>
<div class="card">
  <div class="logo-row">
    <div style="font-size:36px">ê¦†</div>
    <h1>DAFTAR MEMBER</h1>
    <div class="vvip-badge">ðŸ‘‘ SLOT VVIP MASIH TERSEDIA</div>
  </div>

  <div class="slot-info">
    <div>Sisa Slot VVIP</div>
    <div class="slot-num" id="slotNum">â³</div>
    <div style="font-size:11px;color:#9a8050">dari ${CONFIG.MAX_VVIP} slot eksklusif</div>
  </div>

  <div class="bonus-chips">
    <div class="chip">ðŸ’° +Rp 50.000 Bonus</div>
    <div class="chip">ðŸ·ï¸ Diskon 5%</div>
    <div class="chip">ðŸ‘‘ Badge VVIP</div>
  </div>

  <div class="field">
    <label>Nama Lengkap</label>
    <input id="f_nama" placeholder="Contoh: Pak Jamhari" maxlength="50">
  </div>
  <div class="field">
    <label>Username</label>
    <input id="f_user" placeholder="Minimal 4 karakter" maxlength="20" autocapitalize="none">
  </div>
  <div class="field">
    <label>Password</label>
    <input id="f_pass" type="password" placeholder="Minimal 6 karakter" maxlength="30">
  </div>
  <div class="field">
    <label>Nomor HP (WhatsApp)</label>
    <input id="f_phone" type="tel" placeholder="Contoh: 081234567890" maxlength="14">
  </div>
  <div class="field">
    <label>Kota / Asal</label>
    <input id="f_kota" placeholder="Indramayu" maxlength="30" value="Indramayu">
  </div>

  <button class="btn btn-submit" id="btnDaftar" onclick="daftar()">ðŸš€ DAFTAR SEKARANG</button>

  <div class="alert alert-err" id="alertErr"></div>
  <div class="alert alert-ok"  id="alertOk"></div>

  <div class="login-link">Sudah punya akun? <a href="${url}?page=login">Login di sini</a></div>
</div>

<script>
const GAS = '${url}';

// Cek slot VVIP
fetch(GAS+'?page=api&action=vvip_slot').then(r=>r.json()).then(d=>{
  document.getElementById('slotNum').textContent = d.sisa;
  const badge = document.querySelector('.vvip-badge');
  if(!d.masihAda){ badge.textContent='âŒ Slot VVIP Habis'; badge.style.background='#333'; }
}).catch(()=>{document.getElementById('slotNum').textContent='?'});

async function daftar() {
  const btn  = document.getElementById('btnDaftar');
  const eErr = document.getElementById('alertErr');
  const eOk  = document.getElementById('alertOk');
  eErr.style.display='none'; eOk.style.display='none';

  const body = {
    action : 'register',
    nama   : document.getElementById('f_nama').value,
    username:document.getElementById('f_user').value,
    password:document.getElementById('f_pass').value,
    phone  : document.getElementById('f_phone').value,
    kota   : document.getElementById('f_kota').value,
  };

  btn.disabled=true; btn.textContent='â³ Memproses...';

  try {
    const r = await fetch(GAS+'?page=api&action=register', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const d = await r.json();

    if(d.ok){
      eOk.textContent=d.msg; eOk.style.display='block';
      btn.textContent='âœ… Berhasil!';
      setTimeout(()=>{ window.location.href=d.redirect; }, 2000);
    } else {
      eErr.textContent=d.msg; eErr.style.display='block';
      btn.disabled=false; btn.textContent='ðŸš€ DAFTAR SEKARANG';
    }
  } catch(e) {
    eErr.textContent='Gagal terhubung ke server: '+e.message;
    eErr.style.display='block';
    btn.disabled=false; btn.textContent='ðŸš€ DAFTAR SEKARANG';
  }
}

// Enter key
document.addEventListener('keydown', e=>{ if(e.key==='Enter') daftar(); });
</script>
</body></html>`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HTML: LOGIN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function getLoginHtml() {
  const url = getScriptUrl();
  return `<!DOCTYPE html><html lang="id"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0d0d0d;color:#e8d5a0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{background:linear-gradient(135deg,#1a1408,#0d0a02);border:1px solid #3a2c0a;border-radius:20px;padding:32px 28px;max-width:400px;width:100%}
h1{font-size:20px;color:#c9a84c;letter-spacing:2px;text-align:center;margin-bottom:6px}
.sub{text-align:center;font-size:11px;color:#9a8050;letter-spacing:2px;margin-bottom:24px}
.field{margin-bottom:14px}
label{display:block;font-size:11px;color:#9a8050;letter-spacing:2px;text-transform:uppercase;margin-bottom:5px}
input{width:100%;background:#1e1608;border:1.5px solid #3a2c0a;color:#e8d5a0;font-size:14px;padding:11px 14px;border-radius:8px;outline:none;transition:border-color 0.2s}
input:focus{border-color:#c9a84c}
.pass-wrap{position:relative}
.pass-wrap input{padding-right:42px}
.eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:16px;color:#9a8050}
.btn{width:100%;padding:14px;border-radius:10px;font-size:15px;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;letter-spacing:0.5px;margin-top:6px}
.btn-submit{background:linear-gradient(135deg,#c9a84c,#f0d070);color:#000}
.btn-submit:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.4)}
.btn-submit:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.alert{border-radius:8px;padding:12px;font-size:13px;margin-top:12px;display:none}
.alert-err{background:rgba(220,53,69,0.15);border:1px solid rgba(220,53,69,0.3);color:#ff6b7a}
.alert-ok{background:rgba(40,167,69,0.15);border:1px solid rgba(40,167,69,0.3);color:#51cf66}
.reg-link{text-align:center;margin-top:16px;font-size:13px;color:#9a8050}
.reg-link a{color:#c9a84c;text-decoration:none;font-weight:600}
</style>
</head><body>
<div class="card">
  <div style="text-align:center;font-size:36px;margin-bottom:8px">ê¦†</div>
  <h1>LOGIN MEMBER</h1>
  <div class="sub">INDRAMAYU CLUB MAKRIFAT</div>

  <div class="field">
    <label>Username</label>
    <input id="f_user" placeholder="Username Anda" autocapitalize="none">
  </div>
  <div class="field">
    <label>Password</label>
    <div class="pass-wrap">
      <input id="f_pass" type="password" placeholder="Password Anda">
      <span class="eye" onclick="togglePass()">ðŸ‘</span>
    </div>
  </div>

  <button class="btn btn-submit" id="btnLogin" onclick="login()">ðŸ”‘ MASUK</button>
  <div class="alert alert-err" id="alertErr"></div>
  <div class="alert alert-ok"  id="alertOk"></div>
  <div class="reg-link">Belum punya akun? <a href="${url}?page=register">Daftar di sini ðŸš€</a></div>
</div>

<script>
const GAS = '${url}';

function togglePass() {
  const i = document.getElementById('f_pass');
  i.type = i.type==='password' ? 'text' : 'password';
}

async function login() {
  const btn  = document.getElementById('btnLogin');
  const eErr = document.getElementById('alertErr');
  const eOk  = document.getElementById('alertOk');
  eErr.style.display='none'; eOk.style.display='none';

  const body = {
    action  : 'login',
    username: document.getElementById('f_user').value,
    password: document.getElementById('f_pass').value,
  };

  btn.disabled=true; btn.textContent='â³ Memproses...';

  try {
    const r = await fetch(GAS+'?page=api&action=login',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const d = await r.json();

    if(d.ok){
      eOk.textContent=d.msg; eOk.style.display='block';
      localStorage.setItem('icm_token', d.token);
      localStorage.setItem('icm_nama',  d.member.nama);
      btn.textContent='âœ… Berhasil!';
      setTimeout(()=>{ window.location.href=d.redirect; }, 1500);
    } else {
      eErr.textContent=d.msg; eErr.style.display='block';
      btn.disabled=false; btn.textContent='ðŸ”‘ MASUK';
    }
  } catch(e) {
    eErr.textContent='Gagal terhubung: '+e.message;
    eErr.style.display='block';
    btn.disabled=false; btn.textContent='ðŸ”‘ MASUK';
  }
}

document.addEventListener('keydown', e=>{ if(e.key==='Enter') login(); });
</script>
</body></html>`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HTML: DASHBOARD MEMBER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function getDashboardHtml() {
  const url = getScriptUrl();
  return `<!DOCTYPE html><html lang="id"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0d0d0d;color:#e8d5a0;min-height:100vh;padding:20px}
.container{max-width:480px;margin:0 auto}
.header{text-align:center;margin-bottom:20px}
.header h1{font-size:18px;color:#c9a84c;letter-spacing:2px}
/* VVIP CARD */
.member-card{border-radius:16px;padding:24px;margin-bottom:16px;position:relative;overflow:hidden}
.card-vvip{background:linear-gradient(135deg,#2a1f05,#4a3510,#2a1f05);border:2px solid #c9a84c;box-shadow:0 8px 32px rgba(201,168,76,0.3),inset 0 1px 0 rgba(201,168,76,0.2)}
.card-normal{background:linear-gradient(135deg,#1a1408,#0d0a02);border:1px solid #3a2c0a}
.card-shine{position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(45deg,transparent 40%,rgba(201,168,76,0.05) 50%,transparent 60%);animation:shine 4s linear infinite}
@keyframes shine{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.tier-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;padding:4px 14px;border-radius:20px;letter-spacing:1px;margin-bottom:12px}
.badge-vvip{background:linear-gradient(135deg,#c9a84c,#f0d070);color:#000}
.badge-platinum{background:linear-gradient(135deg,#9c9c9c,#e0e0e0);color:#000}
.badge-gold{background:linear-gradient(135deg,#F9A825,#FFD740);color:#000}
.badge-silver{background:linear-gradient(135deg,#78909C,#B0BEC5);color:#000}
.badge-bronze{background:linear-gradient(135deg,#BF360C,#E64A19);color:#fff}
.member-name{font-size:22px;font-weight:700;color:#fff;margin-bottom:4px}
.member-id{font-size:11px;color:#9a8050;letter-spacing:2px}
.saldo-box{background:rgba(0,0,0,0.3);border-radius:10px;padding:16px;margin-top:16px}
.saldo-label{font-size:10px;color:#9a8050;letter-spacing:2px;text-transform:uppercase}
.saldo-val{font-size:28px;font-weight:900;color:#c9a84c;margin:4px 0}
.saldo-sub{font-size:11px;color:#5a4a20}
/* STATS GRID */
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.stat-box{background:#1a1408;border:1px solid #3a2c0a;border-radius:12px;padding:14px;text-align:center}
.stat-val{font-size:20px;font-weight:800;color:#c9a84c}
.stat-label{font-size:10px;color:#9a8050;margin-top:3px;letter-spacing:1px}
/* BONUS LIST */
.bonus-card{background:#1a1408;border:1px solid #3a2c0a;border-radius:12px;padding:16px;margin-bottom:12px}
.bonus-title{font-size:12px;color:#c9a84c;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
.bonus-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #2a1f05}
.bonus-row:last-child{border:none}
.bonus-icon{font-size:20px;flex-shrink:0}
.bonus-text strong{font-size:13px;color:#e8d5a0}
.bonus-text small{display:block;font-size:11px;color:#9a8050;margin-top:1px}
.aktif{color:#51cf66;font-size:10px;background:rgba(81,207,102,0.1);border:1px solid rgba(81,207,102,0.2);padding:2px 8px;border-radius:10px;margin-left:6px}
/* BUTTONS */
.btn-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.btn{padding:12px;border-radius:10px;font-size:13px;font-weight:700;border:none;cursor:pointer;text-align:center;text-decoration:none;display:block;transition:all 0.2s;letter-spacing:0.3px}
.btn-komunitas{background:linear-gradient(135deg,#1a6b3a,#2d9e58);color:#fff}
.btn-kamus{background:linear-gradient(135deg,#7a5c1e,#c9a84c);color:#000}
.btn-logout{background:rgba(220,53,69,0.15);border:1px solid rgba(220,53,69,0.3);color:#ff6b7a;grid-column:1/-1}
.loading{text-align:center;padding:40px;color:#9a8050}
</style>
</head><body>
<div class="container">
  <div class="header">
    <div style="font-size:32px">ê¦†</div>
    <h1>DASHBOARD MEMBER</h1>
    <div style="font-size:11px;color:#5a4a20;letter-spacing:2px">INDRAMAYU CLUB MAKRIFAT</div>
  </div>

  <div id="loadingBox" class="loading">â³ Memuat profil...</div>
  <div id="mainContent" style="display:none"></div>
</div>

<script>
const GAS = '${url}';

function getToken() {
  const u = new URLSearchParams(window.location.search);
  return u.get('token') || localStorage.getItem('icm_token') || '';
}

function tierClass(t) {
  return 'badge-'+(t||'bronze').toLowerCase();
}

function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

async function loadProfile() {
  const token = getToken();
  if (!token) { window.location.href = GAS+'?page=login'; return; }

  try {
    const r = await fetch(GAS+'?page=api&action=profile&token='+encodeURIComponent(token));
    const d = await r.json();

    if (!d.ok) { window.location.href = GAS+'?page=login'; return; }

    const m = d.member;
    localStorage.setItem('icm_token', token);

    const isVvip = m.isVvip === true || m.isVvip === 'true';
    const cardCls = isVvip ? 'card-vvip' : 'card-normal';
    const shine   = isVvip ? '<div class="card-shine"></div>' : '';

    document.getElementById('mainContent').innerHTML = \`
      <div class="member-card \${cardCls}">
        \${shine}
        <div class="tier-badge \${tierClass(m.tier)}">\${m.badge} \${m.tier}</div>
        <div class="member-name">\${m.nama}</div>
        <div class="member-id">\${m.id} Â· Member ke-\${m.nomorUrut}</div>
        <div class="saldo-box">
          <div class="saldo-label">Saldo Anda</div>
          <div class="saldo-val">\${formatRp(m.saldo)}</div>
          <div class="saldo-sub">Terdaftar: \${m.tglDaftar}</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-val">\${m.diskon}%</div>
          <div class="stat-label">Diskon Kas</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">\${m.kota||'Indramayu'}</div>
          <div class="stat-label">Kota</div>
        </div>
      </div>

      \${isVvip ? \`
      <div class="bonus-card">
        <div class="bonus-title">ðŸ‘‘ Bonus VVIP Anda</div>
        <div class="bonus-row">
          <span class="bonus-icon">ðŸ’°</span>
          <div class="bonus-text">
            <strong>Saldo Bonus Rp 50.000 <span class="aktif">âœ“ Aktif</span></strong>
            <small>Dikreditkan saat pendaftaran</small>
          </div>
        </div>
        <div class="bonus-row">
          <span class="bonus-icon">ðŸ·ï¸</span>
          <div class="bonus-text">
            <strong>Diskon Kas 5% Selamanya <span class="aktif">âœ“ Aktif</span></strong>
            <small>Berlaku di semua transaksi Bank Makrifat</small>
          </div>
        </div>
        <div class="bonus-row">
          <span class="bonus-icon">ðŸ‘‘</span>
          <div class="bonus-text">
            <strong>Badge VVIP Eksklusif <span class="aktif">âœ“ Aktif</span></strong>
            <small>Akses fitur & konten khusus VVIP</small>
          </div>
        </div>
      </div>
      \` : ''}

      <div class="btn-row">
        <a href="\${GAS}?page=komunitas" class="btn btn-komunitas">ðŸ  Komunitas</a>
        <a href="\${GAS}?page=kamus" class="btn btn-kamus">ðŸ“– Kamus</a>
        <button class="btn btn-logout" onclick="logout()">ðŸšª Keluar</button>
      </div>

      <div style="font-size:10px;color:#3a2c0a;text-align:center;letter-spacing:2px">
        Â© 2026 INDRAMAYU CLUB MAKRIFAT
      </div>
    \`;

    document.getElementById('loadingBox').style.display  = 'none';
    document.getElementById('mainContent').style.display = 'block';

  } catch(e) {
    document.getElementById('loadingBox').textContent = 'âŒ Gagal memuat: '+e.message;
  }
}

function logout() {
  localStorage.removeItem('icm_token');
  localStorage.removeItem('icm_nama');
  window.location.href = GAS+'?page=login';
}

loadProfile();
</script>
</body></html>`;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HTML: ADMIN PANEL (sederhana)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function getAdminHtml() {
  const url = getScriptUrl();
  return `<!DOCTYPE html><html lang="id"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#0d0d0d;color:#e8d5a0;padding:20px}
.container{max-width:700px;margin:0 auto}
h1{font-size:18px;color:#c9a84c;margin-bottom:4px}
.sub{font-size:11px;color:#9a8050;letter-spacing:2px;margin-bottom:20px}
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
.s-box{background:#1a1408;border:1px solid #3a2c0a;border-radius:10px;padding:14px;text-align:center}
.s-val{font-size:24px;font-weight:900;color:#c9a84c}
.s-lbl{font-size:10px;color:#9a8050;margin-top:3px}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:#1a3a2a;color:#c9a84c;padding:8px;text-align:left;letter-spacing:1px}
td{padding:8px;border-bottom:1px solid #1a1408;color:#e8d5a0}
tr:hover td{background:#1a1408}
.vvip-row td{background:rgba(201,168,76,0.05)}
.badge{font-size:10px;padding:2px 8px;border-radius:10px;font-weight:700}
</style>
</head><body>
<div class="container">
  <h1>âš™ï¸ ADMIN PANEL</h1>
  <div class="sub">INDRAMAYU CLUB MAKRIFAT Â· DATA MEMBER</div>

  <div class="stat-row">
    <div class="s-box"><div class="s-val" id="sTotal">â³</div><div class="s-lbl">Total Member</div></div>
    <div class="s-box"><div class="s-val" id="sVvip">â³</div><div class="s-lbl">Member VVIP</div></div>
    <div class="s-box"><div class="s-val" id="sSisa">â³</div><div class="s-lbl">Slot VVIP Sisa</div></div>
  </div>

  <table>
    <thead><tr><th>ID</th><th>Nama</th><th>Username</th><th>Tier</th><th>Saldo</th><th>Kota</th><th>Daftar</th></tr></thead>
    <tbody id="tBody"><tr><td colspan="7" style="text-align:center;color:#9a8050">â³ Memuat data...</td></tr></tbody>
  </table>
</div>
<script>
const GAS = '${url}';
async function load() {
  const [s, m] = await Promise.all([
    fetch(GAS+'?page=api&action=stats').then(r=>r.json()),
    fetch(GAS+'?page=api&action=members').then(r=>r.json()),
  ]);
  document.getElementById('sTotal').textContent = s.totalMember;
  document.getElementById('sVvip').textContent  = s.vvipTerisi;
  document.getElementById('sSisa').textContent  = s.vvipSisa;

  if(m.ok && m.data.length) {
    document.getElementById('tBody').innerHTML = m.data.map(d=>\`
      <tr class="\${d.tier==='VVIP'?'vvip-row':''}">
        <td>\${d.id}</td>
        <td>\${d.nama}</td>
        <td>\${d.username}</td>
        <td><span class="badge" style="background:\${d.tier==='VVIP'?'#c9a84c':d.tier==='GOLD'?'#F9A825':'#555'};color:\${d.tier==='VVIP'||d.tier==='GOLD'?'#000':'#fff'}">\${d.tier}</span></td>
        <td>Rp \${Number(d.saldo||0).toLocaleString('id-ID')}</td>
        <td>\${d.kota||'-'}</td>
        <td>\${d.tglDaftar||'-'}</td>
      </tr>\`).join('');
  }
}
load();
</script>
</body></html>`;
}
