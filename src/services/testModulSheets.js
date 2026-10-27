const {
  cariPelanggan,
  simpanPelanggan,
  ambilTeknisiHariIni,
  catatTiket,
  updateStatusTiket,
} = require('./sheets');

async function jalankanPengujian() {
  console.log('🧪 Memulai Pengujian Operasi Modul Sheets...\n');

  // Test 1: Cek Teknisi Hari Ini
  console.log('1. Menguji Pencarian Teknisi Shift Hari Ini...');
  const teknisi = await ambilTeknisiHariIni();
  console.log('Teknisi Bertugas:', teknisi || 'Tidak ada teknisi shift hari ini');

  // Test 2: Catat Tiket Uji Coba
  console.log('\n2. Menguji Pembuatan Tiket Baru...');
  const idBaru = await catatTiket({
    jenisTiket: 'perbaikan',
    nama: 'Pak Joko (Test)',
    detail: 'Kabel FO putus tertabrak truk',
    namaTeknisi: teknisi ? teknisi.nama : 'Belum Ditugaskan',
  });

  // Test 3: Ubah Status Tiket yang Baru Saja Dibuat
  console.log(`\n3. Menguji Update Status Tiket ${idBaru}...`);
  await updateStatusTiket(idBaru, 'Selesai');

  console.log('\n🎉 SEMUA PENGUJIAN MODUL BERHASIL!');
}

jalankanPengujian();