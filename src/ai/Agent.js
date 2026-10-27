require('dotenv').config();
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { outputParser } = require('./schemas');
const { promptTemplate } = require('./prompts');
const { getMemory, updateMemory, clearMemory } = require('./memory');

// Inisialisasi Model Gemini Resmi untuk Akun Kamu
const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-3.5-flash',
  modelName: 'gemini-3.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2,
});

/**
 * Memproses pesan masuk dari user dengan alur LangChain
 */
async function prosesPesanAI({ nomorWA, pesanUser, dataPelanggan }) {
  const history = getMemory(nomorWA);
  const formattedHistory = history.map((h) => `${h.role}: ${h.text}`).join('\n');

  // Context Injection
  const statusPelanggan = dataPelanggan ? 'Pelanggan Lama' : 'Pelanggan Baru';
  const namaTerdaftar = dataPelanggan ? dataPelanggan.nama : 'Belum Ada';
  const alamatTerdaftar = dataPelanggan ? dataPelanggan.alamat : 'Belum Ada';

  const inputPrompt = await promptTemplate.format({
    status_pelanggan: statusPelanggan,
    nama_terdaftar: namaTerdaftar,
    alamat_terdaftar: alamatTerdaftar,
    riwayat_chat: formattedHistory || '(Belum ada obrolan)',
    pesan_user: pesanUser,
  });

  const response = await llm.invoke(inputPrompt);
  const teksBalasan = response.content.trim();

  // Mencoba parsing JSON menggunakan LangChain StructuredOutputParser
  try {
    const jsonHasil = await outputParser.parse(teksBalasan);

    // Reset memory jika tiket selesai diproses
    if (jsonHasil.tipe_pesan === 'perbaikan' || jsonHasil.tipe_pesan === 'pemasangan_baru') {
      clearMemory(nomorWA);
    }

    return {
      isCompleteJSON: true,
      data: jsonHasil,
    };
  } catch {
    // Jika data belum lengkap, AI merespons teks natural
    updateMemory(nomorWA, pesanUser, teksBalasan);
    return {
      isCompleteJSON: false,
      textResponse: teksBalasan,
    };
  }
}

module.exports = {
  prosesPesanAI,
  clearMemory,
};