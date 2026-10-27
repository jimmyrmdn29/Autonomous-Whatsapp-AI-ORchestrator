require('dotenv').config();
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

async function testGemini() {
  // 1. Validasi konfigurasi (fail-fast)
  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) {
    console.error('❌ GEMINI_API_KEY atau GEMINI_MODEL belum diisi di .env');
    process.exit(1);
  }

  // 2. Membuat objek model lewat LangChain
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL,
    temperature: 0.3, // rendah = jawaban konsisten, cocok untuk CS
    maxRetries: 2,    // coba ulang otomatis kalau koneksi gagal
  });

  console.log(`🤖 Menghubungi model ${process.env.GEMINI_MODEL}...`);

  try {
    // 3. Mengirim pesan ke AI
    const respon = await model.invoke(
      'Kamu adalah CS RT/RW Net. Sapa pelanggan dengan ramah dalam 1 kalimat.'
    );
    console.log('✅ Berhasil! Jawaban AI:');
    console.log(respon.content);
  } catch (error) {
    // 4. Error handling: terjemahkan error teknis jadi pesan yang mudah dipahami
    const pesan = error.message || '';
    if (pesan.includes('API key') || pesan.includes('API_KEY_INVALID')) {
      console.error('❌ API key salah. Cek lagi GEMINI_API_KEY di .env');
    } else if (pesan.includes('404') || pesan.includes('not found')) {
      console.error('❌ Nama model tidak ditemukan. Cek GEMINI_MODEL di .env');
    } else if (pesan.includes('429') || pesan.includes('quota')) {
      console.error('❌ Kuota gratis habis. Tunggu sebentar lalu coba lagi');
    } else if (pesan.includes('fetch failed') || pesan.includes('ENOTFOUND')) {
      console.error('❌ Tidak ada koneksi internet');
    } else {
      console.error('❌ Error tidak dikenal:', pesan);
    }
    process.exit(1);
  }
}

testGemini();