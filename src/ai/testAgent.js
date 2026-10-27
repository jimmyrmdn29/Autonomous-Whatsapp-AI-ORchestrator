const { prosesPesanAI } = require('./agent');

async function testAI() {
  console.log('🤖 Menguji Respons AI dengan Context Pelanggan Lama...\n');

  const simulasiNomor = '6281111111111';
  const simulasiPelangganLama = {
    nama: 'Pak Joko',
    alamat: 'RT 02 No. 5',
    paket: '10 Mbps',
  };

  // Chat 1: Pelanggan melapor gangguan
  console.log('💬 User: "Halo mas, wifi saya mati lampu merah kelap-kelip"');
  let hasil = await prosesPesanAI({
    nomorWA: simulasiNomor,
    pesanUser: 'Halo mas, wifi saya mati lampu merah kelap-kelip',
    dataPelanggan: simulasiPelangganLama,
  });

  console.log('🤖 Bot:', hasil.isCompleteJSON ? hasil.data : hasil.textResponse);
  console.log('--------------------------------------------------');

  // Chat 2: Menjawab jadwal yang ditanyakan bot
  console.log('💬 User: "Bisa kirim teknisi besok pagi jam 9 mas?"');
  hasil = await prosesPesanAI({
    nomorWA: simulasiNomor,
    pesanUser: 'Bisa kirim teknisi besok pagi jam 9 mas?',
    dataPelanggan: simulasiPelangganLama,
  });

  if (hasil.isCompleteJSON) {
    console.log('🎯 AI BERHASIL EKSTRAKSI JSON LENGKAP:');
    console.dir(hasil.data, { depth: null });
  } else {
    console.log('🤖 Bot:', hasil.textResponse);
  }
}

testAI();