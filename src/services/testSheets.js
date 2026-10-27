require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

async function testSheets() {
  const keyFile = path.join(process.cwd(), 'credentials.json');

  if (!fs.existsSync(keyFile)) {
    console.error('❌ credentials.json tidak ditemukan di root proyek!');
    process.exit(1);
  }
  if (!process.env.SPREADSHEET_ID || process.env.SPREADSHEET_ID === 'belum_ada') {
    console.error('❌ SPREADSHEET_ID belum diisi di .env');
    process.exit(1);
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Cek koneksi spreadsheet
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      fields: 'properties.title,sheets.properties.title',
    });
    console.log(`✅ Terhubung ke: "${meta.data.properties.title}"`);

    // Validasi tab wajib
    const tabs = meta.data.sheets.map((s) => s.properties.title);
    const wajib = ['Jadwal_Shift', 'Log_Tiket', 'Data_Pelanggan'];
    const hilang = wajib.filter((t) => !tabs.includes(t));
    if (hilang.length > 0) {
      console.error(`❌ Tab belum lengkap: ${hilang.join(', ')}`);
      process.exit(1);
    }

    // Baca Jadwal_Shift (Kolom A s/d D)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Jadwal_Shift!A1:D',
    });

    console.log('\n📋 Format Baru Jadwal Shift Teknisi:');
    console.table(res.data.values || []);

    // Simulasi deteksi hari ini
    const daftarHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const hariIni = daftarHari[new Date().getDay()];
    console.log(`\n📅 Hari saat ini: ${hariIni}`);

    const rows = res.data.values ? res.data.values.slice(1) : []; // Lewati baris header
    const teknisiTersedia = rows.filter((row) => {
      const nama = row[0];
      const hariKerja = row[2] || '';
      const status = row[3] || '';
      return status.toLowerCase() === 'aktif' && hariKerja.toLowerCase().includes(hariIni.toLowerCase());
    });

    if (teknisiTersedia.length > 0) {
      console.log(`👷 Teknisi yang bertugas hari ${hariIni}:`);
      teknisiTersedia.forEach((t) => console.log(`   - ${t[0]} (${t[1]})`));
    } else {
      console.log(`⚠️ Tidak ada teknisi yang bertugas pada hari ${hariIni}.`);
    }

    console.log('\n🎉 Uji coba struktur jadwal shift BERHASIL!\n');

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat membaca spreadsheet:', error.message);
    process.exit(1);
  }
}

testSheets();