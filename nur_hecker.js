 /**
 * Proyek: Piramida Guard - Multi-Account Node Core
 * Deskripsi: Mengelola data JSON untuk 10 cadangan akun Nur & sinkronisasi data APK.
 */

const FOLDER_ID = "1Oxz3D7AcWqGgCLv70EgGAImPLcmrmdI1";

// Database Simpanan 10 Akun Cadangan (Default State)
const MULTI_ACCOUNT_DATA = {
  "main":  { name: "Sistem Utama", saldo: "Rp 12.450.000", node: "HDD2JM4_MAIN", status: "Active" },
  "nur1":  { name: "Folder Kas 1", saldo: "Rp 5.200.000",  node: "HDD2JM4_N1",   status: "Backup" },
  "nur2":  { name: "Folder Kas 2", saldo: "Rp 4.850.000",  node: "HDD2JM4_N2",   status: "Backup" },
  "nur3":  { name: "Folder Kas 3", saldo: "Rp 7.120.000",  node: "HDD2JM4_N3",   status: "Active" },
  "nur4":  { name: "Folder Kas 4", saldo: "Rp 3.900.000",  node: "HDD2JM4_N4",   status: "Backup" },
  "nur5":  { name: "Folder Kas 5", saldo: "Rp 6.340.000",  node: "HDD2JM4_N5",   status: "Backup" },
  "nur6":  { name: "Folder Kas 6", saldo: "Rp 8.110.000",  node: "HDD2JM4_N6",   status: "Backup" },
  "nur7":  { name: "Folder Kas 7", saldo: "Rp 4.250.000",  node: "HDD2JM4_N7",   status: "Backup" },
  "nur8":  { name: "Folder Kas 8", saldo: "Rp 9.050.000",  node: "HDD2JM4_N8",   status: "Backup" },
  "nur9":  { name: "Folder Kas 9", saldo: "Rp 11.150.000", node: "HDD2JM4_N9",   status: "Backup" },
  "nur10": { name: "Celengan Inti", saldo: "Rp 15.000.000", node: "HDD2JM4_N10",  status: "Locked" }
};

function doGet(e) {
  const mode = (e && e.parameter && e.parameter.mode) || "json";
  const accountKey = (e && e.parameter && e.parameter.account) || "main";
  
  try {
    // Ambil data spesifik dari salah satu 10 akun cadangan
    const targetAccount = MULTI_ACCOUNT_DATA[accountKey] || MULTI_ACCOUNT_DATA["main"];
    
    // Ambil info berkas APK aktif dari Google Drive
    let apkInfo = { fileName: "Sistem_Guard_v2.apk", size: "Auto" };
    try {
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const files = folder.getFiles();
      while (files.hasNext()) {
        let file = files.next();
        if (file.getName().endsWith(".apk")) {
          apkInfo.fileName = file.getName();
          break;
        }
      }
    } catch(f_err) { /* fallback if drive issue */ }

    // MODE 1: Kirim data berupa JSON murni untuk ditarik oleh Termux / JS Fetch
    if (mode === "json") {
      const outputData = {
        status: "success",
        account: accountKey,
        detail: targetAccount,
        apk: apkInfo,
        all_nodes: MULTI_ACCOUNT_DATA
      };
      return ContentService.createTextOutput(JSON.stringify(outputData))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    // MODE 2: Tampilan Dashboard Kontrol Utama
    if (mode === "dashboard") {
      return HtmlService.createHtmlOutput(buildDashboardHtml(targetAccount, apkInfo))
                        .setTitle("Piramida Guard Server Admin")
                        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function buildDashboardHtml(acc, apk) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Piramida Guard Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; background: #0b0e14; color: #fff; padding: 20px; text-align: center; }
        .box { max-width: 400px; margin: 0 auto; background: #151a24; padding: 20px; border-radius: 12px; border: 1px solid #C9A84C; }
        h2 { color: #C9A84C; font-size: 18px; margin-bottom: 15px; }
        .status { background: rgba(0,200,83,0.1); color: #00c853; padding: 8px; border-radius: 6px; font-weight: bold; margin-bottom: 15px; font-size: 13px; }
        .info-line { display:flex; justify-content:space-between; font-size:13px; padding: 8px 0; border-bottom: 1px solid #222; }
        .btn { display: block; background: #232d3f; color: #fff; padding: 10px; margin-top: 10px; text-decoration: none; border-radius: 6px; font-size: 13px; border:1px solid #334155; }
        .btn-gold { background: #C9A84C; color: #000; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="box">
        <h2>PIRAMIDA GUARD DASHBOARD</h2>
        <div class="status">🟢 SISTEM SIAGA (NODE: ${acc.node})</div>
        <div class="info-line"><span>Nama Bagian:</span> <strong>${acc.name}</strong></div>
        <div class="info-line"><span>Saldo Terkunci:</span> <strong>${acc.saldo}</strong></div>
        <div class="info-line"><span>Status Node:</span> <strong>${acc.status}</strong></div>
        <div class="info-line"><span>Berkas APK:</span> <strong style="font-size:11px;">${apk.fileName}</strong></div>
        
        <a href="http://localhost:777/" target="_blank" class="btn">🔄 Buka Panel Syncthing</a>
        <button class="btn btn-gold" onclick="alert('Konfigurasi Terkunci Aman!')">🛡️ Kunci Konfigurasi Core</button>
      </div>
    </body>
    </html>
  `;
}

