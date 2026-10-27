// Import Modul AI dan Google Sheets
const { prosesPesanAI } = require('../ai/agent');
const {
  cariPelanggan,
  simpanPelanggan,
  ambilTeknisiHariIni,
  catatTiket,
  updateStatusTiket,
} = require('../services/sheets');

/**
 * Menangani setiap pesan masuk dari WhatsApp
 * @param {import('whatsapp-web.js').Client} client 
 * @param {import('whatsapp-web.js').Message} msg 
 */
async function handlePesan(client, msg) {
  try {
    // 1. FILTER PESAN PENGAMAN
    if (msg.fromMe) return;                        // Abaikan pesan dari bot sendiri
    if (msg.from === 'status@broadcast') return;   // Abaikan update status WA
    if (msg.from.endsWith('@g.us')) return;        // Abaikan pesan grup
    if (msg.type !== 'chat') return;               // Hanya proses pesan teks

    const teks = msg.body.trim();
    if (!teks) return;

    // 2. AMBIL NOMOR ASLI PENGIRIM (Format: 628xxxxxxxxxx)
    const kontak = await msg.getContact();
    const nomor = kontak.number;

    console.log(`\n📩 Chat masuk dari [${nomor}]: "${teks}"`);

    // 3. CEK FORMAT SELESAI DARI TEKNISI (Contoh: "SELESAI #T001")
    const regexSelesai = /^SELESAI\s+(#T\d+)/i;
    const matchSelesai = teks.match(regexSelesai);

    if (matchSelesai) {
      const idTiket = matchSelesai[1].toUpperCase();
      console.log(`🔧 Deteksi laporan penyelesaian tiket dari teknisi: ${idTiket}`);

      const berhasil = await updateStatusTiket(idTiket, 'Selesai');
      if (berhasil) {
        await msg.reply(`✅ Laporan diterima! Status tiket *${idTiket}* berhasil diubah menjadi *Selesai*. Terima kasih kerja kerasnya! 👍`);
      } else {
        await msg.reply(`⚠️ Tiket dengan ID *${idTiket}* tidak ditemukan di Log_Tiket.`);
      }
      return;
    }

    // 4. CEK DATABASE PELANGGAN (Context Injection)
    const dataPelanggan = await cariPelanggan(nomor);

    // 5. PROSES PESAN DENGAN LANGCHAIN GEMINI
    const hasilAI = await prosesPesanAI({
      nomorWA: nomor,
      pesanUser: teks,
      dataPelanggan: dataPelanggan,
    });

    // Skenario A: Data Belum Lengkap / Hanya Tanya Informasi
    if (!hasilAI.isCompleteJSON) {
      await msg.reply(hasilAI.textResponse);
      return;
    }

    // Skenario B: Output JSON Lengkap Diterima
    const dataTiket = hasilAI.data;
    console.log('🎯 Data Lengkap Berhasil Diekstrak AI:', dataTiket);

    // B1: Hanya pesan tipe informasi
    if (dataTiket.tipe_pesan === 'informasi') {
      await msg.reply(dataTiket.balasan_ke_user);
      return;
    }

    // B2: Pemesanan / Tiket Gangguan (perbaikan atau pemasangan_baru)
    const teknisi = await ambilTeknisiHariIni();
    const namaTeknisi = teknisi ? teknisi.nama : 'Belum Ditugaskan';

    // Daftarkan ke Data_Pelanggan jika pasang baru & belum ada di spreadsheet
    if (dataTiket.tipe_pesan === 'pemasangan_baru' && !dataPelanggan) {
      await simpanPelanggan({
        nomorWA: nomor,
        nama: dataTiket.nama,
        alamat: dataTiket.alamat,
        paket: dataTiket.paket_dipilih,
      });
    }

    // Susun detail tiket
    const detailLaporan = dataTiket.tipe_pesan === 'perbaikan'
      ? `Kendala: ${dataTiket.kategori_gangguan} | Jadwal: ${dataTiket.jadwal}`
      : `Pasang Baru: ${dataTiket.paket_dipilih} | Jadwal: ${dataTiket.jadwal}`;

    // Catat ke tab Log_Tiket
    const idTiketBaru = await catatTiket({
      jenisTiket: dataTiket.tipe_pesan,
      nama: dataTiket.nama,
      detail: detailLaporan,
      namaTeknisi: namaTeknisi,
    });

    // 6. Balas Konfirmasi ke Pelanggan
    const pesanPelanggan = `Terima kasih *${dataTiket.nama}*. Laporan Anda telah berhasil kami jadwalkan dengan ID Tiket: *${idTiketBaru}*.\n\n📍 Alamat: ${dataTiket.alamat}\n🛠 Jenis: ${dataTiket.tipe_pesan.toUpperCase()}\n⏰ Jadwal: ${dataTiket.jadwal}\n👷 Teknisi: ${namaTeknisi}\n\nTeknisi kami akan segera memproses laporan Anda.`;
    await msg.reply(pesanPelanggan);

    // 7. Notifikasi Penugasan Otomatis ke Nomor WA Teknisi
    if (teknisi && teknisi.nomorWA) {
      const waTeknisiJid = `${teknisi.nomorWA}@c.us`;
      const notifTeknisi = `🚨 *TUGAS BARU [${idTiketBaru}]* 🚨\n\nHalo *${teknisi.nama}*, ada penugasan ${dataTiket.tipe_pesan} baru:\n- Pelanggan: ${dataTiket.nama}\n- Alamat: ${dataTiket.alamat}\n- Kontak Pelanggan: wa.me/${nomor}\n- Detail: ${detailLaporan}\n\nSetelah tugas tuntas, silakan balas pesan ini dengan format:\n👉 *SELESAI ${idTiketBaru}*`;

      await client.sendMessage(waTeknisiJid, notifTeknisi);
      console.log(`📢 Penugasan berhasil diteruskan ke teknisi: ${teknisi.nama} (${teknisi.nomorWA})`);
    } else {
      console.warn('⚠️ Tidak ada teknisi bertugas hari ini untuk dikirimi tugas.');
    }

  } catch (error) {
    // Error satu pesan tidak boleh membuat seluruh bot crash/mati
    console.error('❌ Gagal memproses pesan:', error);
    await msg.reply('Mohon maaf, terjadi kendala teknis pada sistem kami. Silakan ulangi beberapa saat lagi.');
  }
}

module.exports = { handlePesan };