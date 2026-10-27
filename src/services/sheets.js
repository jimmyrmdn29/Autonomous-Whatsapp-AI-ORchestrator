require('dotenv').config();
const path = require('path');
const { google } = require('googleapis');

// 1. Inisialisasi Koneksi Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), 'credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

/**
 * 2. Mencari pelanggan berdasarkan nomor WhatsApp
 * @param {string} nomorWA - Format: '628xxxxxxxxxx'
 * @returns {object|null} Data pelanggan jika ada, atau null jika baru
 */
async function cariPelanggan(nomorWA) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Data_Pelanggan!A2:D',
    });

    const rows = res.data.values || [];
    // Format kolom: [0: Nomor WA, 1: Nama, 2: Alamat, 3: Paket]
    const customer = rows.find((r) => String(r[0]).trim() === String(nomorWA).trim());

    if (!customer) return null;

    return {
      nomorWA: customer[0],
      nama: customer[1],
      alamat: customer[2],
      paket: customer[3] || '-',
    };
  } catch (error) {
    console.error('❌ Error cariPelanggan:', error.message);
    throw error;
  }
}

/**
 * 3. Menyimpan data pelanggan baru
 * @param {object} param0 { nomorWA, nama, alamat, paket }
 */
async function simpanPelanggan({ nomorWA, nama, alamat, paket = '-' }) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Data_Pelanggan!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[String(nomorWA), nama, alamat, paket]],
      },
    });
    console.log(`✅ Pelanggan baru tersimpan: ${nama} (${nomorWA})`);
  } catch (error) {
    console.error('❌ Error simpanPelanggan:', error.message);
    throw error;
  }
}

/**
 * 4. Mencari teknisi yang bertugas pada hari ini
 * @returns {object|null} Data teknisi yang standby atau null jika tidak ada
 */
async function ambilTeknisiHariIni() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Jadwal_Shift!A2:D',
    });

    const rows = res.data.values || [];
    const daftarHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const hariIni = daftarHari[new Date().getDay()];

    // Format kolom: [0: Nama, 1: Nomor WA, 2: Hari Kerja, 3: Status]
    const teknisiTersedia = rows.filter((r) => {
      const hariKerja = r[2] || '';
      const status = r[3] || '';
      return (
        status.toLowerCase() === 'aktif' &&
        hariKerja.toLowerCase().includes(hariIni.toLowerCase())
      );
    });

    if (teknisiTersedia.length === 0) return null;

    // Default: Ambil teknisi pertama yang tersedia hari ini
    const teknisiTerpilih = teknisiTersedia[0];
    return {
      nama: teknisiTerpilih[0],
      nomorWA: teknisiTerpilih[1],
    };
  } catch (error) {
    console.error('❌ Error ambilTeknisiHariIni:', error.message);
    throw error;
  }
}

/**
 * 5. Membuat tiket baru di Log_Tiket dengan ID auto-increment (#T001, #T002, dst)
 * @param {object} param0 { jenisTiket, nama, detail, namaTeknisi }
 * @returns {string} ID Tiket yang dibuat
 */
async function catatTiket({ jenisTiket, nama, detail, namaTeknisi }) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Log_Tiket!A2:A',
    });

    const rows = res.data.values || [];
    const urutan = rows.length + 1;
    const idTiket = `#T${String(urutan).padStart(3, '0')}`; // Contoh: #T001

    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Format Header: ID Tiket | Timestamp | Jenis Tiket | Nama | Detail | Teknisi | Status
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Log_Tiket!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[idTiket, timestamp, jenisTiket, nama, detail, namaTeknisi, 'Diproses']],
      },
    });

    console.log(`✅ Tiket ${idTiket} berhasil dicatat.`);
    return idTiket;
  } catch (error) {
    console.error('❌ Error catatTiket:', error.message);
    throw error;
  }
}

/**
 * 6. Memperbarui status tiket (misal saat teknisi chat "SELESAI #T001")
 * @param {string} idTiket - misal "#T001"
 * @param {string} statusBaru - misal "Selesai"
 * @returns {boolean} true jika berhasil diupdate
 */
async function updateStatusTiket(idTiket, statusBaru = 'Selesai') {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Log_Tiket!A:A',
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((r) => r[0] && r[0].trim().toUpperCase() === idTiket.trim().toUpperCase());

    if (rowIndex === -1) {
      console.warn(`⚠️ Tiket ${idTiket} tidak ditemukan.`);
      return false;
    }

    // Nomor baris di sheet = index array + 1
    const targetRow = rowIndex + 1;
    // Kolom G adalah kolom Status
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Log_Tiket!G${targetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[statusBaru]],
      },
    });

    console.log(`✅ Status Tiket ${idTiket} diperbarui menjadi: ${statusBaru}`);
    return true;
  } catch (error) {
    console.error('❌ Error updateStatusTiket:', error.message);
    throw error;
  }
}

module.exports = {
  cariPelanggan,
  simpanPelanggan,
  ambilTeknisiHariIni,
  catatTiket,
  updateStatusTiket,
};