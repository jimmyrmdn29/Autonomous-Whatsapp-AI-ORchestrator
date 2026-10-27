require('dotenv').config();
const { buatClientWhatsApp } = require('./services/whatsapp');
const { handlePesan } = require('./handlers/messageHandler');

console.log('🚀 Memulai Bot RT/RW Net...');

// 1. Validasi konfigurasi
const wajib = ['GEMINI_API_KEY', 'GEMINI_MODEL', 'SPREADSHEET_ID'];
const kosong = wajib.filter((key) => !process.env[key]);
if (kosong.length > 0) {
  console.error(`❌ Variabel belum ada di .env: ${kosong.join(', ')}`);
  process.exit(1);
}

// 2. Buat client WhatsApp
const client = buatClientWhatsApp();

// 3. Sambungkan event pesan masuk ke handler
client.on('message', (msg) => handlePesan(client, msg));

// 4. Jalankan koneksi
client.initialize().catch((error) => {
  console.error('❌ Gagal menjalankan WhatsApp:', error.message);
  process.exit(1);
});

// 5. Jaring pengaman terakhir: tangkap error yang lolos
process.on('unhandledRejection', (error) => {
  console.error('⚠️ Error tak tertangani:', error);
});