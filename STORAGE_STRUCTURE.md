# 📦 STRUKTUR PENYIMPANAN ASET INDRAMAYU CLUB

## 🗂️ FOLDER STRUCTURE REKOMENDASI

```
indramayu-club/
├── assets/
│   ├── gif/                    # Penyimpanan GIF animasi
│   │   ├── badges/            # Badge & achievement GIF
│   │   ├── rewards/           # Reward animation GIF
│   │   └── mascot/            # Mascot character GIF
│   │
│   ├── images/
│   │   ├── logo/              # Logo & branding
│   │   ├── ui/                # UI elements
│   │   └── backgrounds/       # Background images
│   │
│   └── vouchers/              # Voucher images
│       ├── png/               # Voucher design
│       └── qr-codes/          # QR code untuk voucher
│
├── data/
│   ├── users/                 # Data member
│   ├── transactions/          # Transaksi Rp/coin
│   ├── vouchers/              # Database voucher
│   └── rewards/               # Reward catalog
│
├── public/
│   └── uploads/               # Upload file dari user
│       ├── avatars/
│       ├── proof/             # Bukti transaksi
│       └── documents/
│
└── database/
    └── sheets/                # Google Sheets storage
```

## 🏦 OPSI PENYIMPANAN (RECOMMENDED)

### ✅ OPSI 1: Google Drive (Untuk Aset Statis)
**Cocok untuk:** GIF, Images, Voucher design
- Folder: `Indramayu-Club/Assets/GIF/`
- Folder: `Indramayu-Club/Assets/Vouchers/`
- Folder: `Indramayu-Club/Assets/Images/`
- Link sharing: Gunakan Drive API untuk akses publik

### ✅ OPSI 2: Google Sheets (Untuk Data Coin/Currency)
**Cocok untuk:** Tracking Rp, Coin balance, transaksi
- Sheet: "Member_Coins" → kolom: ID, Name, Balance, History
- Sheet: "Vouchers" → kolom: Code, Value, Status, Used_Date
- Sheet: "Transactions" → kolom: Date, Member, Type, Amount, Balance

### ✅ OPSI 3: Firebase (Untuk Produksi/Real-time)
**Cocok untuk:** Database real-time, authentication
- Storage: GIF dan images
- Firestore: Data member, balance, transaksi
- Realtime Database: Live balance update

### ✅ OPSI 4: Cloudinary (Untuk Media Hosting)
**Cocok untuk:** CDN, automatic optimization
- Upload GIF, image, voucher design
- Auto resize & compression
- Fast delivery worldwide

---

## 💾 REKOMENDASI UNTUK PROYEK ANDA

| Aset | Storage | Alasan |
|------|---------|--------|
| **GIF** | Google Drive + CDN | Besar, static, perlu cepat |
| **Voucher Image** | Google Drive | Design statis, mudah manage |
| **Member Data** | Google Sheets | Gratis, mudah diakses |
| **Coin/Rp Balance** | Google Sheets | Real-time tracking simple |
| **Transaction Log** | Google Sheets | Audit trail, history |
| **User Avatar** | Google Drive | Profile picture |

---

## 🔗 IMPLEMENTASI DENGAN APPS SCRIPT

### Baca GIF dari Google Drive
```javascript
function getGifFromDrive(fileName) {
  const folder = DriveApp.getFoldersByName('Indramayu-Club/Assets/GIF').next();
  const file = folder.getFilesByName(fileName).next();
  const url = file.getDownloadUrl() + '&export=download';
  return url;
}
```

### Simpan Voucher Code
```javascript
function saveVoucherCode(memberId, voucherCode, value) {
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow([new Date(), memberId, voucherCode, value, 'UNUSED']);
}
```

### Update Coin Balance
```javascript
function updateCoinBalance(memberId, amount) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === memberId) {
      const currentBalance = values[i][2] || 0;
      sheet.getRange(i + 1, 3).setValue(currentBalance + amount);
      sheet.appendRow([new Date(), memberId, 'ADD_COIN', amount, currentBalance + amount]);
      break;
    }
  }
}
```

---

## 📊 STRUKTUR SHEET GOOGLE

### Sheet 1: Members
| ID | Name | Email | Balance (Rp) | Coin | Status |
|----|------|-------|-------------|------|--------|
| 001 | Dulkohar | dulkohar@email.com | 500000 | 100 | ACTIVE |
| 002 | Budi | budi@email.com | 250000 | 50 | ACTIVE |

### Sheet 2: Vouchers
| Code | Value (Rp) | Type | Status | Created | Used_Date |
|------|-----------|------|--------|---------|-----------|
| V001 | 50000 | DISCOUNT | USED | 2026-01-01 | 2026-06-29 |
| V002 | 100000 | CASHBACK | UNUSED | 2026-01-02 | - |

### Sheet 3: Transactions
| Date | Member_ID | Type | Amount | New_Balance | Description |
|------|-----------|------|--------|-------------|-------------|
| 2026-06-29 | 001 | TOP_UP | 100000 | 600000 | Transfer Bank |
| 2026-06-29 | 001 | VOUCHER | -50000 | 550000 | Voucher V001 |

### Sheet 4: GIF_Assets
| Name | Google_Drive_ID | URL | Category | Size_KB |
|------|-----------------|-----|----------|---------|
| badge_hero.gif | 1abc2def3ghi | [link] | BADGE | 256 |
| animation_win.gif | 2xyz9uvw8rst | [link] | REWARD | 512 |

---

## 🎯 LANGKAH IMPLEMENTASI

1. **Buat Folder Google Drive:**
   ```
   Indramayu-Club/
   ├── Assets/
   │   ├── GIF/
   │   ├── Vouchers/
   │   └── Images/
   ```

2. **Buat Google Sheet:**
   - Sheets: Members, Vouchers, Transactions, GIF_Assets
   - Share dengan akses Apps Script

3. **Update bagian2.html** untuk referensi aset dari folder

4. **Deploy Apps Script** dengan fungsi CRUD untuk coin/voucher

---

**Pilihan terbaik untuk Anda:** Google Drive + Google Sheets (GRATIS, mudah, terintegrasi dengan Apps Script) ✨
