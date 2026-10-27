const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

/**
 * Mencari lokasi Chrome secara otomatis.
 * Urutan: dari .env dulu, lalu lokasi instalasi umum di Windows.
 */
function cariChrome() {
  const kandidat = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA &&
      path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
  ].filter(Boolean); // buang yang kosong

  const ditemukan = kandidat.find((p) => fs.existsSync(p));

  if (!ditemukan) {
    console.error('❌ Chrome tidak ditemukan di laptop ini.');
    console.error('👉 Buka chrome://version, salin "Executable Path", lalu isi CHROME_PATH di .env');
    process.exit(1);
  }

  console.log(`🌐 Chrome ditemukan: ${ditemukan}`);
  return ditemukan;
}

function buatClientWhatsApp() {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot-rtrw' }),
    puppeteer: {
      headless: true,
      executablePath: cariChrome(), // pakai Chrome yang sudah terinstal
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  // ... semua client.on(...) di bawah ini TETAP seperti sebelumnya

  client.on('qr', (qr) => {
    console.log('📱 Scan QR berikut dengan WhatsApp nomor BOT:');
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('🔐 Login berhasil, sesi disimpan.');
  });

  client.on('auth_failure', (pesan) => {
    console.error('❌ Login gagal:', pesan);
    console.error('👉 Hapus folder .wwebjs_auth lalu jalankan ulang untuk scan QR baru.');
  });

  client.on('ready', () => {
    console.log('✅ Bot WhatsApp siap menerima pesan.');
  });

  client.on('disconnected', (alasan) => {
    console.warn('⚠️ Koneksi WhatsApp terputus:', alasan);
    console.warn('👉 Jalankan ulang program dengan: npm start');
  });

  return client;
}

module.exports = { buatClientWhatsApp };