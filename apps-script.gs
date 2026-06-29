// ========================================
// APPS SCRIPT FOR INDRAMAYU CLUB
// Database Management for Netflix Platform
// ========================================

// ========== SPREADSHEET SETUP ==========
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace dengan ID Google Sheets Anda
const SHEETS = {
  MEMBERS: 'Members',
  TRANSACTIONS: 'Transactions',
  VOUCHERS: 'Vouchers',
  GIF_ASSETS: 'GIF_Assets',
  INTERACTIONS: 'Interactions',
  VIDEOS: 'Videos'
};

// ========== INITIALIZE SHEETS ==========
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create sheets if they don't exist
  createSheetIfNotExists(ss, SHEETS.MEMBERS);
  createSheetIfNotExists(ss, SHEETS.TRANSACTIONS);
  createSheetIfNotExists(ss, SHEETS.VOUCHERS);
  createSheetIfNotExists(ss, SHEETS.GIF_ASSETS);
  createSheetIfNotExists(ss, SHEETS.INTERACTIONS);
  createSheetIfNotExists(ss, SHEETS.VIDEOS);

  // Initialize headers
  initializeHeaders(ss);
  Logger.log('✅ Sheets initialized successfully!');
}

function createSheetIfNotExists(ss, sheetName) {
  if (!ss.getSheetByName(sheetName)) {
    ss.insertSheet(sheetName);
    Logger.log(`Created sheet: ${sheetName}`);
  }
}

function initializeHeaders(ss) {
  // Members Header
  const membersSheet = ss.getSheetByName(SHEETS.MEMBERS);
  if (membersSheet.getLastRow() === 0) {
    membersSheet.appendRow([
      'ID', 'Nama', 'Email', 'Avatar_URL', 'Badge', 'Level', 
      'Coin_Balance', 'Rp_Balance', 'Video_URL', 'Status', 
      'Join_Date', 'Last_Active'
    ]);
  }

  // Transactions Header
  const transSheet = ss.getSheetByName(SHEETS.TRANSACTIONS);
  if (transSheet.getLastRow() === 0) {
    transSheet.appendRow([
      'Date', 'Member_ID', 'Type', 'Amount', 'New_Balance', 
      'Description', 'Status', 'Timestamp'
    ]);
  }

  // Vouchers Header
  const voucherSheet = ss.getSheetByName(SHEETS.VOUCHERS);
  if (voucherSheet.getLastRow() === 0) {
    voucherSheet.appendRow([
      'Voucher_Code', 'Value_Rp', 'Coin_Value', 'Category', 
      'Status', 'Used_By', 'Used_Date', 'Created_Date', 'Expired_Date'
    ]);
  }

  // GIF Assets Header
  const gifSheet = ss.getSheetByName(SHEETS.GIF_ASSETS);
  if (gifSheet.getLastRow() === 0) {
    gifSheet.appendRow([
      'GIF_ID', 'GIF_Name', 'Drive_URL', 'Category', 'Harga_Nur', 
      'Coin_Value', 'Size_KB', 'Status', 'Created_Date'
    ]);
  }

  // Interactions Header
  const intSheet = ss.getSheetByName(SHEETS.INTERACTIONS);
  if (intSheet.getLastRow() === 0) {
    intSheet.appendRow([
      'ID', 'Member_ID', 'Target_Member_ID', 'Type', 'Count', 
      'Timestamp', 'Description'
    ]);
  }

  // Videos Header
  const vidSheet = ss.getSheetByName(SHEETS.VIDEOS);
  if (vidSheet.getLastRow() === 0) {
    vidSheet.appendRow([
      'Video_ID', 'Member_ID', 'YouTube_URL', 'Title', 'Likes', 
      'Comments', 'Shares', 'Rewards', 'Upload_Date'
    ]);
  }
}

// ========== MEMBER FUNCTIONS ==========
function addMember(memberId, nama, email, avatarUrl, badge, level) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.MEMBERS);
  
  sheet.appendRow([
    memberId,
    nama,
    email,
    avatarUrl,
    badge,
    level,
    0,        // Coin Balance
    0,        // Rp Balance
    '',       // Video URL
    'ACTIVE',
    new Date(),
    new Date()
  ]);
  
  Logger.log(`✅ Member ${nama} added successfully!`);
  return { success: true, message: `Member ${nama} berhasil ditambahkan` };
}

function getMember(memberId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.MEMBERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === memberId) {
      return {
        id: data[i][0],
        nama: data[i][1],
        email: data[i][2],
        avatar: data[i][3],
        badge: data[i][4],
        level: data[i][5],
        coinBalance: data[i][6],
        rpBalance: data[i][7],
        videoUrl: data[i][8],
        status: data[i][9]
      };
    }
  }
  return null;
}

function getAllMembers() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.MEMBERS);
  const data = sheet.getDataRange().getValues();
  
  const members = [];
  for (let i = 1; i < data.length; i++) {
    members.push({
      id: data[i][0],
      nama: data[i][1],
      email: data[i][2],
      avatar: data[i][3],
      badge: data[i][4],
      level: data[i][5],
      coinBalance: data[i][6],
      rpBalance: data[i][7],
      videoUrl: data[i][8],
      status: data[i][9]
    });
  }
  return members;
}

// ========== COIN & RP BALANCE FUNCTIONS ==========
function updateCoinBalance(memberId, amount, description) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.MEMBERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === memberId) {
      const currentBalance = data[i][6] || 0;
      const newBalance = currentBalance + amount;
      
      sheet.getRange(i + 1, 7).setValue(newBalance);
      
      // Log transaction
      logTransaction(memberId, 'COIN', amount, newBalance, description);
      
      Logger.log(`✅ Coin updated: ${memberId} = ${newBalance}`);
      return { success: true, newBalance: newBalance };
    }
  }
  return { success: false, message: 'Member not found' };
}

function updateRpBalance(memberId, amount, description) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.MEMBERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === memberId) {
      const currentBalance = data[i][7] || 0;
      const newBalance = currentBalance + amount;
      
      sheet.getRange(i + 1, 8).setValue(newBalance);
      
      // Log transaction
      logTransaction(memberId, 'RP', amount, newBalance, description);
      
      Logger.log(`✅ Rp updated: ${memberId} = ${newBalance}`);
      return { success: true, newBalance: newBalance };
    }
  }
  return { success: false, message: 'Member not found' };
}

// ========== TRANSACTION LOGGING ==========
function logTransaction(memberId, type, amount, newBalance, description) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.TRANSACTIONS);
  
  sheet.appendRow([
    new Date().toLocaleDateString('id-ID'),
    memberId,
    type,
    amount,
    newBalance,
    description,
    'COMPLETED',
    new Date()
  ]);
}

// ========== VOUCHER FUNCTIONS ==========
function createVoucher(code, valueRp, coinValue, category, expiredDate) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.VOUCHERS);
  
  sheet.appendRow([
    code,
    valueRp,
    coinValue,
    category,
    'AVAILABLE',
    '',
    '',
    new Date(),
    expiredDate
  ]);
  
  Logger.log(`✅ Voucher ${code} created!`);
  return { success: true, code: code };
}

function useVoucher(voucherCode, memberId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.VOUCHERS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === voucherCode) {
      if (data[i][4] !== 'AVAILABLE') {
        return { success: false, message: 'Voucher sudah digunakan atau expired' };
      }
      
      const valueRp = data[i][1];
      const coinValue = data[i][2];
      
      // Update voucher status
      sheet.getRange(i + 1, 5).setValue('USED');
      sheet.getRange(i + 1, 6).setValue(memberId);
      sheet.getRange(i + 1, 7).setValue(new Date());
      
      // Update member balance
      updateRpBalance(memberId, valueRp, `Voucher: ${voucherCode}`);
      updateCoinBalance(memberId, coinValue, `Voucher: ${voucherCode}`);
      
      Logger.log(`✅ Voucher ${voucherCode} used by ${memberId}`);
      return { 
        success: true, 
        message: `Voucher berhasil digunakan! +${valueRp} Rp, +${coinValue} Coin` 
      };
    }
  }
  
  return { success: false, message: 'Voucher tidak ditemukan' };
}

function getAvailableVouchers() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.VOUCHERS);
  const data = sheet.getDataRange().getValues();
  
  const vouchers = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === 'AVAILABLE') {
      vouchers.push({
        code: data[i][0],
        valueRp: data[i][1],
        coinValue: data[i][2],
        category: data[i][3],
        expiredDate: data[i][8]
      });
    }
  }
  return vouchers;
}

// ========== GIF ASSETS FUNCTIONS ==========
function addGifAsset(gifId, gifName, driveUrl, category, hargaNur, coinValue) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.GIF_ASSETS);
  
  sheet.appendRow([
    gifId,
    gifName,
    driveUrl,
    category,
    hargaNur,
    coinValue,
    0,        // Size KB
    'ACTIVE',
    new Date()
  ]);
  
  Logger.log(`✅ GIF Asset ${gifName} added!`);
  return { success: true, gifId: gifId };
}

function getGifAssets(category) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.GIF_ASSETS);
  const data = sheet.getDataRange().getValues();
  
  const assets = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === category && data[i][7] === 'ACTIVE') {
      assets.push({
        gifId: data[i][0],
        gifName: data[i][1],
        driveUrl: data[i][2],
        category: data[i][3],
        hargaNur: data[i][4],
        coinValue: data[i][5]
      });
    }
  }
  return assets;
}

// ========== INTERACTION TRACKING ==========
function recordInteraction(memberId, targetMemberId, type, count = 1) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.INTERACTIONS);
  
  sheet.appendRow([
    Utilities.getUuid(),
    memberId,
    targetMemberId,
    type,  // 'LIKE', 'COMMENT', 'SHARE', 'REWARD'
    count,
    new Date(),
    `${type} from ${memberId} to ${targetMemberId}`
  ]);
  
  Logger.log(`✅ Interaction recorded: ${type}`);
  return { success: true };
}

function getInteractionStats(memberId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.INTERACTIONS);
  const data = sheet.getDataRange().getValues();
  
  let stats = {
    likes: 0,
    comments: 0,
    shares: 0,
    rewards: 0
  };
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === memberId) {
      const type = data[i][3];
      if (type === 'LIKE') stats.likes += data[i][4];
      else if (type === 'COMMENT') stats.comments += data[i][4];
      else if (type === 'SHARE') stats.shares += data[i][4];
      else if (type === 'REWARD') stats.rewards += data[i][4];
    }
  }
  
  return stats;
}

// ========== VIDEO MANAGEMENT ==========
function addVideo(memberId, youtubeUrl, title) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.VIDEOS);
  
  sheet.appendRow([
    Utilities.getUuid(),
    memberId,
    youtubeUrl,
    title,
    0,  // Likes
    0,  // Comments
    0,  // Shares
    0,  // Rewards
    new Date()
  ]);
  
  Logger.log(`✅ Video added for ${memberId}`);
  return { success: true, message: 'Video berhasil ditambahkan' };
}

function getMemberVideos(memberId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.VIDEOS);
  const data = sheet.getDataRange().getValues();
  
  const videos = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === memberId) {
      videos.push({
        videoId: data[i][0],
        youtubeUrl: data[i][2],
        title: data[i][3],
        likes: data[i][4],
        comments: data[i][5],
        shares: data[i][6],
        rewards: data[i][7],
        uploadDate: data[i][8]
      });
    }
  }
  return videos;
}

// ========== WEB APP ENDPOINTS ==========
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      case 'getMember':
        return returnData(getMember(e.parameter.memberId));
      
      case 'getAllMembers':
        return returnData(getAllMembers());
      
      case 'getVouchers':
        return returnData(getAvailableVouchers());
      
      case 'getGifAssets':
        return returnData(getGifAssets(e.parameter.category));
      
      case 'getInteractionStats':
        return returnData(getInteractionStats(e.parameter.memberId));
      
      case 'getMemberVideos':
        return returnData(getMemberVideos(e.parameter.memberId));
      
      default:
        return returnData({ error: 'Action tidak dikenali' }, 400);
    }
  } catch(error) {
    Logger.log('Error: ' + error);
    return returnData({ error: error.toString() }, 500);
  }
}

function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);
  
  try {
    switch(action) {
      case 'addMember':
        return returnData(addMember(
          data.memberId, data.nama, data.email, 
          data.avatarUrl, data.badge, data.level
        ));
      
      case 'updateCoinBalance':
        return returnData(updateCoinBalance(
          data.memberId, data.amount, data.description
        ));
      
      case 'updateRpBalance':
        return returnData(updateRpBalance(
          data.memberId, data.amount, data.description
        ));
      
      case 'useVoucher':
        return returnData(useVoucher(data.voucherCode, data.memberId));
      
      case 'recordInteraction':
        return returnData(recordInteraction(
          data.memberId, data.targetMemberId, data.type, data.count
        ));
      
      case 'addVideo':
        return returnData(addVideo(
          data.memberId, data.youtubeUrl, data.title
        ));
      
      case 'createVoucher':
        return returnData(createVoucher(
          data.code, data.valueRp, data.coinValue, 
          data.category, data.expiredDate
        ));
      
      case 'addGifAsset':
        return returnData(addGifAsset(
          data.gifId, data.gifName, data.driveUrl,
          data.category, data.hargaNur, data.coinValue
        ));
      
      default:
        return returnData({ error: 'Action tidak dikenali' }, 400);
    }
  } catch(error) {
    Logger.log('Error: ' + error);
    return returnData({ error: error.toString() }, 500);
  }
}

function returnData(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========== SAMPLE DATA ==========
function createSampleData() {
  // Add sample members
  addMember('M001', 'Dulkohar', 'dulkohar@email.com', 'https://via.placeholder.com/300', '⭐⭐⭐', 'Gold');
  addMember('M002', 'Budi Santoso', 'budi@email.com', 'https://via.placeholder.com/300', '⭐⭐', 'Silver');
  addMember('M003', 'Siti Nurhaliza', 'siti@email.com', 'https://via.placeholder.com/300', '⭐⭐⭐⭐', 'Platinum');
  
  // Add sample vouchers
  createVoucher('V001', 50000, 50, 'DISCOUNT', '2026-12-31');
  createVoucher('V002', 100000, 100, 'CASHBACK', '2026-12-31');
  
  // Add sample GIF assets
  addGifAsset('G001', 'Hero Badge', 'https://drive.google.com/...', 'BADGE', 1000, 50);
  addGifAsset('G002', 'Victory Animation', 'https://drive.google.com/...', 'REWARD', 2000, 100);
  
  Logger.log('✅ Sample data created!');
}
